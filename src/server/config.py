import os
from pathlib import Path
from dotenv import load_dotenv

SERVER_ROOT = Path(__file__).resolve().parent
load_dotenv(SERVER_ROOT.parents[1] / 'config' / '.env', override=False)

IMAGE_SIZE = 48
NORMALIZATION_FACTOR = 255.0
MODEL_PATH = str(Path(os.getenv('MODEL_PATH', SERVER_ROOT / 'ZFNETModelV8-2026.h5')).resolve())
DATA_ROOT = Path(os.getenv('DATA_ROOT', SERVER_ROOT / 'data')).resolve()
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
DATA_FILE = 'analysis_data.json'
WEEKLY_RESULTS_FILE = 'weekly_combined_results.json'
EMOTION_TIMELINE_FILE = 'emotion_timeline.json'
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
FIREBASE_PROJECT_ID = os.getenv('FIREBASE_PROJECT_ID', 'zenlens-thesis')
CLIENT_BUILD = Path(os.getenv('CLIENT_BUILD', SERVER_ROOT.parent / 'client' / 'build')).resolve()
