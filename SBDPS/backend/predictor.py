"""Loads the trained models and turns symptom codes into ranked, explained predictions."""
import json

import joblib
import numpy as np

from .config import DEFAULT_MODEL, DISEASES_JSON, METRICS_JSON, MODEL_LABELS, MODELS_DIR, SYMPTOMS_JSON, TOP_K
from .nlp import SymptomExtractor


class Predictor:
    def __init__(self, models_dir=MODELS_DIR):
        self.symptoms = json.loads(SYMPTOMS_JSON.read_text(encoding="utf8"))
        self.diseases = {d["name"]: d for d in json.loads(DISEASES_JSON.read_text(encoding="utf8"))}
        self.metrics = json.loads(METRICS_JSON.read_text(encoding="utf8"))
        self.codes = [s["code"] for s in self.symptoms]
        self.red_flags = {s["code"] for s in self.symptoms if s["red_flag"]}
        self.extractor = SymptomExtractor(self.symptoms)
        self.models = {k: joblib.load(models_dir / f"{k}.joblib") for k in self.metrics["models"]}
        self.default_model = DEFAULT_MODEL if DEFAULT_MODEL in self.models else self.metrics["best_model"]

    # -- helpers ---------------------------------------------------------------------------
    def label(self, key: str) -> str:
        return MODEL_LABELS.get(key, key)

    def clean_codes(self, codes) -> list[str]:
        valid = set(self.codes)
        return [c for c in dict.fromkeys(codes or []) if c in valid]

    def _vector(self, codes) -> np.ndarray:
        chosen = set(codes)
        return np.array([[1 if c in chosen else 0 for c in self.codes]])

    @staticmethod
    def _match_score(disease: dict, chosen: set) -> tuple[float, list[str]]:
        weights = [3 if i < 2 else 1 for i, _ in enumerate(disease["symptoms"])]
        matched = [c for c in disease["symptoms"] if c in chosen]
        mw = sum(w for w, c in zip(weights, disease["symptoms"]) if c in chosen)
        coverage = mw / sum(weights)
        return round(coverage * 0.55 + (len(matched) / max(1, len(chosen))) * 0.45, 4), matched

    # -- main API --------------------------------------------------------------------------
    def predict(self, codes, model_key=None, top_k=TOP_K) -> dict:
        codes = self.clean_codes(codes)
        if not codes:
            raise ValueError("No valid symptoms were provided.")
        key = model_key if model_key in self.models else self.default_model
        model = self.models[key]
        proba = model.predict_proba(self._vector(codes))[0]
        order = np.argsort(proba)[::-1]
        chosen = set(codes)
        ranked = []
        for idx in order:
            d = self.diseases[model.classes_[idx]]
            score, matched = self._match_score(d, chosen)
            if matched:
                ranked.append((d, float(proba[idx]), score, matched))
        top = ranked[:top_k]
        # Safety rule: never hide a high-urgency condition that matches 2+ of the symptoms.
        extra = next((r for r in ranked if r[0]["urgency"] == "high" and len(r[3]) >= 2 and r not in top), None)
        if extra and len(top) == top_k:
            top[-1] = extra
        predictions = [{
            "disease": d["name"], "category": d["category"], "urgency": d["urgency"],
            "description": d["description"], "probability": round(min(p, 0.99), 4),
            "match_score": score, "matched": matched,
        } for d, p, score, matched in top]
        emergency = bool(chosen & self.red_flags) or any(
            p["urgency"] == "high" and len(p["matched"]) >= 2 and p["probability"] > 0.2 for p in predictions)
        return {"model": key, "model_label": self.label(key), "symptoms": codes,
                "emergency": emergency, "predictions": predictions}
