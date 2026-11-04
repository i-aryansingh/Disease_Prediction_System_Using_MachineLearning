"""Central configuration: project paths and constants."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATASET_DIR = ROOT / "dataset"
MODELS_DIR = ROOT / "models"
FRONTEND_DIR = ROOT / "frontend"

DATASET_CSV = DATASET_DIR / "symptom_dataset.csv"
SYMPTOMS_JSON = DATASET_DIR / "symptoms.json"
DISEASES_JSON = DATASET_DIR / "diseases.json"
METRICS_JSON = MODELS_DIR / "metrics.json"

RANDOM_STATE = 42
TOP_K = 3
DEFAULT_MODEL = "naive_bayes"  # model served by the API (benchmark winner is stored in models/metrics.json)

MODEL_LABELS = {
    "random_forest": "Random Forest",
    "svm": "SVM (RBF)",
    "knn": "KNN (k=7)",
    "naive_bayes": "Naive Bayes",
    "neural_network": "Neural Network (MLP)",
}
