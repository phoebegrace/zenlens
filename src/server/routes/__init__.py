from .analyze import analyze_bp
from .history import history_bp
from .emotion_timeline import timeline_bp
from .results import results_bp

def register_routes(app, prefix='', name_prefix=''):
    for blueprint in (analyze_bp, history_bp, timeline_bp, results_bp):
        app.register_blueprint(blueprint, url_prefix=prefix, name=name_prefix + blueprint.name)
