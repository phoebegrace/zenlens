import os
import json
import logging

from config import DATA_FILE, EMOTION_TIMELINE_FILE, WEEKLY_RESULTS_FILE

logger = logging.getLogger(__name__)

def load_data(file_path=DATA_FILE):
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r') as file:
                data = json.load(file)
                return data if data else []
        except json.JSONDecodeError as e:
            logger.error(f"Error loading {file_path}: {e}")
            return []
    return []

def save_data(data, file_path=DATA_FILE):
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4)
        
def load_emotion_timeline(file_path=EMOTION_TIMELINE_FILE):
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r') as file:
                data = json.load(file)
                return data if data else []
        except json.JSONDecodeError as e:
            logger.error(f"Error loading {file_path}: {e}")
            return []
    return[]

def save_emotion_timeline(new_entries, file_path=EMOTION_TIMELINE_FILE):
    existing_data = load_emotion_timeline(file_path)
    
    combined_data = existing_data + new_entries
    
    with open(file_path, 'w') as file:
        json.dump(combined_data, file, indent=4)
        
def load_weekly_results(file_path=WEEKLY_RESULTS_FILE):
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r') as file:
                data = json.load(file)
                return data if data else []
        except json.JSONDecodeError:
            return []
    return []
        
def save_weekly_results(data, file_path=WEEKLY_RESULTS_FILE):
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4)

def save_daily_results(new_daily_results, file_path='daily_emotion_timeline.json'):
    existing_data = []
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            try:
                existing_data = json.load(file)
            except json.JSONDecodeError:
                logger.error(f"Error loading existing data from {file_path}. Initializing with empty list.")
        
    combined_data = existing_data + new_daily_results
    
    with open(file_path, 'w') as file:
        json.dump(combined_data, file, indent=4)