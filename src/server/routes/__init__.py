from .analyze import analyze_bp
from .history import history_bp
from .emotion_timeline import timeline_bp
from .results import results_bp

def register_routes(app):
    app.register_blueprint(analyze_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(timeline_bp)
    app.register_blueprint(results_bp)
