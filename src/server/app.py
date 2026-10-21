import logging
import os
from flask import Flask, g, jsonify, request, send_from_directory
from werkzeug.exceptions import HTTPException
from config import CLIENT_BUILD, DATA_ROOT
from routes import register_routes
from services.security import authenticate

logging.basicConfig(level=logging.INFO)


def create_app():
    app = Flask(__name__, static_folder=None)
    app.config.update(MAX_CONTENT_LENGTH=100 * 1024 * 1024, DATA_ROOT=DATA_ROOT)
    register_routes(app)
    register_routes(app, prefix='/api', name_prefix='api_')

    @app.before_request
    def protect_api():
        if request.endpoint and (request.endpoint.startswith(('api_', 'analyze_bp.', 'history_bp.', 'timeline_bp.', 'results_bp.'))):
            if not authenticate():
                return jsonify(error='Please sign in to ASTRA to continue.'), 401

    @app.after_request
    def protect_response(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['Referrer-Policy'] = 'same-origin'
        if getattr(g, 'user_id', None):
            response.headers['Cache-Control'] = 'private, no-store'
        if getattr(g, 'image_token', None):
            response.set_cookie('astra_image_auth', g.image_token, max_age=3500,
                                httponly=True, secure=True, samesite='Strict', path='/api/processed')
        return response

    @app.errorhandler(HTTPException)
    def http_error(error):
        return jsonify(error=error.description), error.code

    @app.errorhandler(Exception)
    def internal_error(error):
        app.logger.exception('Unhandled request error')
        return jsonify(error='ASTRA could not complete this request. Please try again.'), 500

    @app.get('/health')
    def health():
        return jsonify(status='ok', app='ASTRA')

    @app.get('/')
    @app.get('/<path:path>')
    def client(path=''):
        if path.startswith('api/'):
            return jsonify(error='Endpoint not found'), 404
        if path and (CLIENT_BUILD / path).is_file():
            return send_from_directory(CLIENT_BUILD, path)
        return send_from_directory(CLIENT_BUILD, 'index.html')

    return app


if __name__ == '__main__':
    create_app().run(host='0.0.0.0', port=int(os.getenv('PORT', '5001')), debug=False)
