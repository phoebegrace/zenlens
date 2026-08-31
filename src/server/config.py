import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

env_path = Path(__file__).resolve().parents[2] / 'config' / '.env'
load_dotenv(dotenv_path=env_path)

IMAGE_SIZE = 48
NORMALIZATION_FACTOR = 255.0
MODEL_PATH = "ZFNETModelV6.h5"
UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "processed"
DATA_FILE = "analysis_data.json"
WEEKLY_RESULTS_FILE = "weekly_combined_results.json"
EMOTION_TIMELINE_FILE = "emotion_timeline.json"
OPENAI_API_KEY = os.getenv("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")
