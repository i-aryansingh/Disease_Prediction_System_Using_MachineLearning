"""Train and compare the classifiers, then save them to models/.

Run from the project root:  python -m backend.train_models
"""
import json
import time

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.naive_bayes import BernoulliNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC

from .config import DATASET_CSV, METRICS_JSON, MODEL_LABELS, MODELS_DIR, RANDOM_STATE


def make_models():
    return {
        "random_forest": RandomForestClassifier(n_estimators=150, random_state=RANDOM_STATE, n_jobs=-1),
        "svm": SVC(kernel="rbf", C=5, probability=True, random_state=RANDOM_STATE),
        "knn": KNeighborsClassifier(n_neighbors=7, metric="hamming", algorithm="brute"),
        "naive_bayes": BernoulliNB(),
        "neural_network": MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=400, random_state=RANDOM_STATE),
    }


def main():
    df = pd.read_csv(DATASET_CSV)
    X, y = df.drop(columns="prognosis"), df["prognosis"]
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE)
    print(f"Train {len(X_tr)} | Test {len(X_te)} | Features {X.shape[1]} | Classes {y.nunique()}")
    MODELS_DIR.mkdir(exist_ok=True)
    results = {}
    for key, model in make_models().items():
        t0 = time.time()
        model.fit(X_tr.values, y_tr)
        pred = model.predict(X_te.values)
        cv = cross_val_score(model, X.values, y, cv=StratifiedKFold(5, shuffle=True, random_state=RANDOM_STATE), n_jobs=-1)
        results[key] = {
            "label": MODEL_LABELS[key],
            "accuracy": round(accuracy_score(y_te, pred), 4),
            "precision": round(precision_score(y_te, pred, average="macro", zero_division=0), 4),
            "recall": round(recall_score(y_te, pred, average="macro", zero_division=0), 4),
            "f1": round(f1_score(y_te, pred, average="macro", zero_division=0), 4),
            "cv_mean": round(float(cv.mean()), 4),
            "cv_std": round(float(cv.std()), 4),
        }
        joblib.dump(model, MODELS_DIR / f"{key}.joblib", compress=3)
        print(f"{MODEL_LABELS[key]:22s} acc={results[key]['accuracy']:.3f} f1={results[key]['f1']:.3f} "
              f"cv={results[key]['cv_mean']:.3f}±{results[key]['cv_std']:.3f} ({time.time()-t0:.1f}s)")
    best = max(results, key=lambda k: (results[k]["f1"], results[k]["accuracy"]))
    payload = {"best_model": best, "n_train": len(X_tr), "n_test": len(X_te), "features": list(X.columns), "models": results}
    METRICS_JSON.write_text(json.dumps(payload, indent=1), encoding="utf8")
    print("Best model:", MODEL_LABELS[best])
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        names = [results[k]["label"] for k in results]
        fig, ax = plt.subplots(figsize=(8, 4))
        ax.bar(names, [results[k]["accuracy"] * 100 for k in results], color="#1559C7")
        ax.set_ylabel("Test accuracy (%)"); ax.set_ylim(0, 105); ax.set_title("SBDPS model comparison")
        plt.xticks(rotation=15); plt.tight_layout(); plt.savefig(MODELS_DIR / "model_comparison.png", dpi=150)
    except Exception as exc:  # chart is optional
        print("Chart skipped:", exc)


if __name__ == "__main__":
    main()
