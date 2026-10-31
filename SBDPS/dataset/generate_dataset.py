"""Generate a labelled symptom dataset from the curated knowledge base.

Each row is one synthetic patient: one 0/1 column per symptom plus a `prognosis` label.
Typical symptoms of a disease appear with high probability (the first two "key" symptoms
more often), and unrelated symptoms appear rarely as noise. The CSV has the same layout
as public symptom/disease datasets, so a real dataset can be dropped in unchanged.

Run from the project root:  python -m dataset.generate_dataset
"""
import json

import numpy as np
import pandas as pd

from backend.config import DATASET_CSV, DISEASES_JSON, RANDOM_STATE, SYMPTOMS_JSON

SAMPLES_PER_DISEASE = 150
P_KEY, P_OTHER, P_NOISE = 0.90, 0.65, 0.02


def build() -> pd.DataFrame:
    symptoms = json.loads(SYMPTOMS_JSON.read_text(encoding="utf8"))
    diseases = json.loads(DISEASES_JSON.read_text(encoding="utf8"))
    code_to_col = {s["code"]: s["column"] for s in symptoms}
    columns = [s["column"] for s in symptoms]
    rng = np.random.default_rng(RANDOM_STATE)
    rows = []
    for d in diseases:
        own = set(d["symptoms"])
        for _ in range(SAMPLES_PER_DISEASE):
            row = {c: 0 for c in columns}
            for i, code in enumerate(d["symptoms"]):
                if rng.random() < (P_KEY if i < 2 else P_OTHER):
                    row[code_to_col[code]] = 1
            for s in symptoms:
                if s["code"] not in own and rng.random() < P_NOISE:
                    row[s["column"]] = 1
            if sum(row.values()) < 2:  # a patient reports at least two symptoms
                for code in d["symptoms"][:2]:
                    row[code_to_col[code]] = 1
            row["prognosis"] = d["name"]
            rows.append(row)
    return pd.DataFrame(rows).sample(frac=1, random_state=RANDOM_STATE).reset_index(drop=True)


if __name__ == "__main__":
    df = build()
    df.to_csv(DATASET_CSV, index=False)
    print(f"Saved {len(df)} rows x {df.shape[1]-1} symptoms, {df['prognosis'].nunique()} diseases -> {DATASET_CSV}")
