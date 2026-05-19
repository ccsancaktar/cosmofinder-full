import atexit
import os
from datetime import timedelta

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

try:
    import sentry_sdk
    from sentry_sdk.integrations.flask import FlaskIntegration
except ImportError:  # pragma: no cover - opsiyonel dependency
    sentry_sdk = None
    FlaskIntegration = None

from auth import auth_bp
from config import COFFEE_UPLOADS_DIR, TAROT_ASSETS_DIR, get_allowed_origins, load_environment
from payment_system import payment_bp
from premium import premium_bp
from rate_limiting import create_limiter
from readings import readings_bp
from revenuecat_sync import revenuecat_bp
from routes import register_route_blueprints
from scheduler import setup_scheduler, stop_scheduler
from tokens import tokens_bp


def _configure_sentry():
    sentry_dsn = os.getenv("SENTRY_DSN")
    if sentry_dsn and sentry_sdk and FlaskIntegration:
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[FlaskIntegration()],
            traces_sample_rate=1.0,
            environment=os.getenv("FLASK_ENV", "development"),
        )


def create_app():
    load_environment()
    _configure_sentry()

    app = Flask(__name__)

    required_env_vars = ["JWT_SECRET", "MONGO_URI"]
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=365)
    app.config["TAROT_ASSETS_DIR"] = str(TAROT_ASSETS_DIR)
    app.config["COFFEE_UPLOADS_DIR"] = str(COFFEE_UPLOADS_DIR)

    CORS(
        app,
        origins=get_allowed_origins(),
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )
    JWTManager(app)
    create_limiter(app)

    @app.after_request
    def add_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        if response.is_json:
            response.headers["Content-Type"] = "application/json"
        return response

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(readings_bp, url_prefix="/api/readings")
    app.register_blueprint(tokens_bp, url_prefix="/api/tokens")
    app.register_blueprint(premium_bp, url_prefix="/api/premium")
    app.register_blueprint(payment_bp, url_prefix="/api/payment")
    app.register_blueprint(revenuecat_bp, url_prefix="/api/revenuecat")
    register_route_blueprints(app)

    should_start_scheduler = True
    if os.getenv("FLASK_DEBUG", "False").lower() == "true":
        should_start_scheduler = os.environ.get("WERKZEUG_RUN_MAIN") == "true"

    if should_start_scheduler:
        setup_scheduler()
        atexit.register(stop_scheduler)

    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    host = os.environ.get("HOST", "0.0.0.0")
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    app.run(host=host, port=port, debug=debug_mode, threaded=True)
