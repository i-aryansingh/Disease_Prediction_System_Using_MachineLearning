def test_health(client):
    j = client.get("/api/health").get_json()
    assert j["status"] == "ok" and j["diseases"] == 40


def test_symptoms_and_diseases(client):
    assert len(client.get("/api/symptoms").get_json()) >= 50
    assert len(client.get("/api/diseases").get_json()) == 40


def test_models_endpoint(client):
    j = client.get("/api/models").get_json()
    assert "random_forest" in j["models"] and j["models"]["random_forest"]["accuracy"] > 0.8


def test_predict_with_codes(client):
    r = client.post("/api/predict", json={"symptoms": ["co", "bc", "wl", "ns"]})
    assert r.status_code == 200
    assert r.get_json()["predictions"][0]["disease"] == "Tuberculosis"


def test_predict_with_text(client):
    r = client.post("/api/predict", json={"text": "pet dard, ulti aur dast"})
    assert r.status_code == 200 and r.get_json()["symptoms"]


def test_predict_validation(client):
    assert client.post("/api/predict", json={}).status_code == 400


def test_frontend_served(client):
    r = client.get("/")
    assert r.status_code == 200 and b"SBDPS" in r.data
