from flask import Blueprint, current_app, jsonify, send_from_directory


assets_bp = Blueprint("assets", __name__)


@assets_bp.route("/assets/tarot/<path:filename>", methods=["GET"])
def serve_tarot_image(filename):
    try:
        return send_from_directory(current_app.config["TAROT_ASSETS_DIR"], filename)
    except Exception as exc:
        return jsonify({"error": f"Resim bulunamadı: {str(exc)}"}), 404


@assets_bp.route("/uploads/coffee/<path:filename>", methods=["GET"])
def serve_coffee_upload(filename):
    try:
        return send_from_directory(current_app.config["COFFEE_UPLOADS_DIR"], filename)
    except Exception as exc:
        return jsonify({"error": f"Resim bulunamadı: {str(exc)}"}), 404
