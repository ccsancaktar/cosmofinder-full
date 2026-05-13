from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from models import User


notifications_bp = Blueprint("notifications", __name__)


def _load_user(user_id):
    user = User.find_by_id(user_id)
    if user:
        return user, None
    return None, (jsonify({"error": "Kullanıcı bulunamadı"}), 404)


@notifications_bp.route("/register", methods=["POST"])
@jwt_required()
def register_push_token():
    try:
        user, error_response = _load_user(get_jwt_identity())
        if error_response:
            return error_response

        data = request.get_json() or {}
        push_token = data.get("push_token")

        if not push_token:
            return jsonify({"error": "Push token gereklidir"}), 400

        user.push_token = push_token
        user.save()

        return jsonify(
            {
                "message": "Push token başarıyla kaydedildi",
                "push_token": push_token,
            }
        ), 200
    except Exception as exc:
        return jsonify({"error": f"Push token kayıt hatası: {str(exc)}"}), 500


@notifications_bp.route("/settings", methods=["GET"])
@jwt_required()
def get_notification_settings():
    try:
        user, error_response = _load_user(get_jwt_identity())
        if error_response:
            return error_response

        return jsonify(
            {
                "notifications_enabled": user.notifications_enabled,
                "notification_settings": user.notification_settings,
            }
        ), 200
    except Exception as exc:
        return jsonify({"error": f"Bildirim ayarları alınamadı: {str(exc)}"}), 500


@notifications_bp.route("/settings", methods=["PUT"])
@jwt_required()
def update_notification_settings():
    try:
        user, error_response = _load_user(get_jwt_identity())
        if error_response:
            return error_response

        data = request.get_json() or {}

        if "notifications_enabled" in data:
            user.notifications_enabled = bool(data["notifications_enabled"])

        if "notification_settings" in data and isinstance(data["notification_settings"], dict):
            user.notification_settings = {
                **user.notification_settings,
                **data["notification_settings"],
            }

        user.save()

        return jsonify(
            {
                "message": "Bildirim ayarları güncellendi",
                "notifications_enabled": user.notifications_enabled,
                "notification_settings": user.notification_settings,
            }
        ), 200
    except Exception as exc:
        return jsonify({"error": f"Bildirim ayarları güncellenemedi: {str(exc)}"}), 500


@notifications_bp.route("/history", methods=["GET"])
@jwt_required()
def get_notification_history():
    try:
        user, error_response = _load_user(get_jwt_identity())
        if error_response:
            return error_response

        return jsonify(
            {
                "history": user.notification_history or [],
            }
        ), 200
    except Exception as exc:
        return jsonify({"error": f"Bildirim geçmişi alınamadı: {str(exc)}"}), 500
