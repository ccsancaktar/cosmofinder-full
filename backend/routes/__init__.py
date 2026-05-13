from .assets_routes import assets_bp
from .diagnostic_routes import diagnostic_bp
from .fortune_routes import fortune_bp
from .health_routes import health_bp
from .notification_routes import notifications_bp


def register_route_blueprints(app):
    app.register_blueprint(health_bp)
    app.register_blueprint(fortune_bp, url_prefix="/api")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(diagnostic_bp, url_prefix="/api")
    app.register_blueprint(assets_bp)
