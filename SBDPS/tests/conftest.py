import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app import create_app  # noqa: E402
from backend.predictor import Predictor  # noqa: E402


@pytest.fixture(scope="session")
def predictor():
    return Predictor()


@pytest.fixture()
def client(predictor):
    app = create_app(predictor)
    app.config["TESTING"] = True
    return app.test_client()
