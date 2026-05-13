from datetime import datetime
import os

from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from cache_utils import cache_utils
from rate_limiting import get_rate_limit_info
from redis_manager import redis_manager


diagnostic_bp = Blueprint("diagnostics", __name__)


@diagnostic_bp.route("/redis/stats", methods=["GET"])
def get_redis_stats():
    try:
        return jsonify(
            {
                "redis_stats": redis_manager.get_stats(),
                "cache_stats": cache_utils.get_cache_stats(),
                "timestamp": datetime.utcnow().isoformat(),
            }
        ), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@diagnostic_bp.route("/redis/flush", methods=["POST"])
def flush_redis_cache():
    try:
        if os.getenv("FLASK_ENV") != "development":
            return jsonify({"error": "Bu endpoint sadece development modunda kullanılabilir"}), 403

        if not redis_manager.flush_db():
            return jsonify({"error": "Cache temizleme başarısız"}), 500

        return jsonify({"message": "Redis cache temizlendi"}), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@diagnostic_bp.route("/rate-limits", methods=["GET"])
@jwt_required()
def get_user_rate_limits():
    try:
        user_id = get_jwt_identity()
        endpoints = ["yildizname", "rune", "tarot", "chinese", "coffee", "kabala", "daily"]
        rate_limits = {endpoint: get_rate_limit_info(user_id, endpoint) for endpoint in endpoints}

        return jsonify(
            {
                "user_id": user_id,
                "rate_limits": rate_limits,
                "timestamp": datetime.now().isoformat(),
            }
        ), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
