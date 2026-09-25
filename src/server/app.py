from flask import Flask
from flask_cors import CORS
from routes import register_routes
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_app():
    app = Flask(__name__)

    CORS(app)

    register_routes(app)

    return app


if __name__ == "__main__":
    app = create_app()

    app.run(
        host="127.0.0.1",
        port=5001,
        debug=False,
    )