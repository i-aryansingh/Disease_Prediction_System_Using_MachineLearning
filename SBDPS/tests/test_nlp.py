def test_english_symptoms(predictor):
    assert {"fv", "hd"} <= set(predictor.extractor.extract("I have fever and a headache"))


def test_hinglish_symptoms(predictor):
    found = predictor.extractor.extract("mujhe do din se bukhar hai aur sir dard, badan dard bhi")
    assert {"fv", "hd", "ba"} <= set(found)


def test_devanagari_symptoms(predictor):
    assert "fv" in predictor.extractor.extract("मुझे बुखार है")


def test_negation_is_ignored(predictor):
    found = predictor.extractor.extract("no fever but cough")
    assert "fv" not in found and "co" in found
    assert "fv" not in predictor.extractor.extract("bukhar nahi hai")


def test_empty_text(predictor):
    assert predictor.extractor.extract("") == []
