"""Flask application: REST API + static hosting of the frontend.

Run from the project root:  python -m backend.app   ->  http://localhost:5000
"""
from flask import Flask, jsonify, request, send_from_directory

from .config import FRONTEND_DIR
from .predictor import Predictor


def create_app(predictor: Predictor | None = None) -> Flask:
    app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")
    pred = predictor or Predictor()

    @app.after_request
    def add_cors(resp):  # lets the frontend call the API even when opened from a file
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
        resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        return resp

    @app.route("/")
    def index():
        return send_from_directory(app.static_folder, "index.html")

    @app.get("/api/health")
    def health():
        return jsonify(status="ok", model=pred.default_model, model_label=pred.label(pred.default_model),
                       symptoms=len(pred.symptoms), diseases=len(pred.diseases))

    @app.get("/api/symptoms")
    def symptoms():
        return jsonify([{k: s[k] for k in ("code", "name", "hinglish", "red_flag")} for s in pred.symptoms])

    @app.get("/api/diseases")
    def diseases():
        return jsonify(sorted(pred.diseases.values(), key=lambda d: d["name"]))

    @app.get("/api/models")
    def models():
        m = pred.metrics
        return jsonify(best_model=m["best_model"], n_train=m["n_train"], n_test=m["n_test"], models=m["models"])

    @app.post("/api/extract")
    def extract():
        data = request.get_json(silent=True) or {}
        codes = pred.extractor.extract(data.get("text", ""))
        return jsonify(symptoms=codes, names=[next(s["name"] for s in pred.symptoms if s["code"] == c) for c in codes])

    @app.route("/api/predict", methods=["POST", "OPTIONS"])
    def predict():
        if request.method == "OPTIONS":
            return ("", 204)
        data = request.get_json(silent=True) or {}
        codes = list(data.get("symptoms") or [])
        if data.get("text"):
            codes += pred.extractor.extract(data["text"])
        try:
            return jsonify(pred.predict(codes, data.get("model")))
        except ValueError as exc:
            return jsonify(error=str(exc)), 400

    return app


if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=5000, debug=False)
