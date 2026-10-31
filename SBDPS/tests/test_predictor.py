import pytest


def test_returns_three_ranked_predictions(predictor):
    out = predictor.predict(["fv", "hd", "ba"])
    assert len(out["predictions"]) == 3
    probs = [p["probability"] for p in out["predictions"]]
    assert all(0 <= p <= 1 for p in probs)


def test_classic_cases(predictor):
    assert predictor.predict(["ye", "du", "na", "al"])["predictions"][0]["category"] in {"Infectious", "Digestive"}
    names = [p["disease"] for p in predictor.predict(["th", "fu", "bv", "ft"])["predictions"]]
    assert "Type 2 diabetes" in names


def test_heart_attack_is_flagged_urgent(predictor):
    out = predictor.predict(["cp", "la", "cw", "sb"])
    assert out["emergency"] is True
    assert any(p["urgency"] == "high" for p in out["predictions"])


def test_invalid_codes_are_dropped(predictor):
    assert predictor.predict(["fv", "bogus"])["symptoms"] == ["fv"]


def test_no_symptoms_raises(predictor):
    with pytest.raises(ValueError):
        predictor.predict([])


def test_every_model_can_predict(predictor):
    for key in predictor.models:
        assert predictor.predict(["fv", "co"], key)["model"] == key
