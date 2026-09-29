import os
from dotenv import load_dotenv
from pathlib import Path

# env_path = Path(__file__).resolve().parents[2] / "config" / ".env"
# load_dotenv(dotenv_path=env_path, override=True)
load_dotenv()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

IMAGE_SIZE = 48
NORMALIZATION_FACTOR = 255.0

MODEL_PATH = "CNNModelV11-2026-2.h5"

UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "processed"

DATA_FILE = os.path.join(BASE_DIR, "analysis_data.json")
WEEKLY_RESULTS_FILE = os.path.join(BASE_DIR, "weekly_combined_results.json")
EMOTION_TIMELINE_FILE = os.path.join(BASE_DIR, "emotion_timeline.json")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")