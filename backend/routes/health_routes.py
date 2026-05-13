from datetime import datetime
import os

from flask import Blueprint, jsonify

from models import is_database_available
from redis_manager import redis_manager


health_bp = Blueprint("health", __name__)


def _health_payload():
    redis_status = redis_manager.is_connected
    database_status = is_database_available()
    return {
        "status": "healthy" if database_status else "degraded",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "database": "connected" if database_status else "disconnected",
        "redis": "connected" if redis_status else "disconnected",
        "environment": os.getenv("FLASK_ENV", "development"),
    }


@health_bp.route("/health", methods=["GET"])
def health_check_root():
    try:
        return jsonify(_health_payload()), 200
    except Exception as exc:
        return jsonify(
            {
                "status": "unhealthy",
                "timestamp": datetime.now().isoformat(),
                "error": str(exc),
                "environment": os.getenv("FLASK_ENV", "development"),
            }
        ), 500


@health_bp.route("/api/health", methods=["GET"])
def health_check():
    try:
        return jsonify(_health_payload()), 200
    except Exception as exc:
        return jsonify(
            {
                "status": "unhealthy",
                "timestamp": datetime.now().isoformat(),
                "error": str(exc),
                "environment": os.getenv("FLASK_ENV", "development"),
            }
        ), 500
