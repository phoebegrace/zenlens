import os
import time
import logging
from tensorflow.keras.models import load_model
from tensorflow.keras.backend import clear_session

from config import MODEL_PATH

# Variables, not functions:
model = load_model(MODEL_PATH)
emotion_labels = ['angry', 'disgust', 'afraid', 'happy', 'neutral', 'sad', 'surprise']
emotion_scores = {'happy': 0, 'surprise': 1, 'neutral': 0, 'disgust': 1, 'sad': 2, 'afraid': 3, 'angry': 3}
max_score = 3
