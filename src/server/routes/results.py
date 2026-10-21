from flask import Blueprint, request, jsonify, send_from_directory
import os
import logging

from services.data_handler import load_data, load_weekly_results, save_weekly_results, data_path, user_root, user_lock, save_data
from services.stress_utils import group_by_week, calculate_weekly_averages
from config import WEEKLY_RESULTS_FILE

logger = logging.getLogger(__name__)

results_bp = Blueprint('results_bp', __name__)

@results_bp.route('/combined-results', methods=['GET'])
def combined_results():
    stress_category = request.args.get('stress_category', '').lower()
    
    weekly_averages = load_weekly_results(WEEKLY_RESULTS_FILE)
    
    if stress_category:
        weekly_averages = [entry for entry in weekly_averages if entry['stress_category'].lower() == stress_category]
    return jsonify(weekly_averages)

@results_bp.route('/get-weekly-recommendation', methods=['GET'])
def get_weekly_recommendation():
    try:
        weekly_results = load_weekly_results(WEEKLY_RESULTS_FILE)
        
        recommendations = [
            {
                "week": entry.get("week"),
                "stress_category": entry.get("stress_category"),
                "openai_response": entry.get("openai_response")
            }
            for entry in weekly_results
        ]
        return jsonify(recommendations), 200
    except Exception as e:
        logger.error(f"Error fetching weekly recommendations: {str(e)}")
        return jsonify({"error": "Unable to fetch recommendations at this time."}), 500
    
@results_bp.route('/weekly-combined-results.json', methods=['GET'])
def get_weekly_combined_results():
    try:
        directory = os.path.dirname(str(data_path(WEEKLY_RESULTS_FILE)))
        filename = os.path.basename(WEEKLY_RESULTS_FILE)
        return send_from_directory(directory=directory, path=filename)
    except Exception as e:
        logger.error(f"Error serving weekly_combined_results.json: {str(e)}")
        return jsonify({"error": "Unable to fetch weekly combined results."}), 500
    
@results_bp.route('/processed/<path:filename>', methods=['GET'])
def get_processed_image(filename):
    folder_path = request.args.get('folder_path')
    if not folder_path:
        return jsonify({"error": "Missing folder_path"}), 400
    from pathlib import Path
    uploads = (user_root() / 'uploads').resolve()
    # Return and accept only paths relative to the authenticated user's root.
    folder = (user_root() / folder_path).resolve()
    if not folder.is_relative_to(uploads) or folder.name != 'processed':
        return jsonify({"error": "Invalid folder path"}), 403
    try:
        return send_from_directory(folder, filename)
    except Exception:
        return jsonify({"error": "Processed image not found."}), 404


@results_bp.route('/save-combined-results', methods=['POST'])
def save_combined_results():
    from datetime import datetime
    from services.stress_utils import categorize_stress
    payload = request.get_json(silent=True) or {}
    try:
        start = datetime.strptime(payload['start_date'], '%Y-%m-%d').date()
        end = datetime.strptime(payload['end_date'], '%Y-%m-%d').date()
        if end < start:
            raise ValueError()
    except (KeyError, TypeError, ValueError):
        return jsonify(error='Select a valid date range.'), 400
    with user_lock():
        sessions = [entry for entry in load_data() if start.isoformat() <= entry['date'] <= end.isoformat()]
        total_faces = sum(entry['total_faces'] for entry in sessions)
        if not total_faces:
            return jsonify(error='No analyzed sessions in this date range.'), 400
        average = sum(entry['average_stress'] * entry['total_faces'] for entry in sessions) / total_faces
        result = dict(start_date=start.isoformat(), end_date=end.isoformat(), total_faces=total_faces,
                      average_stress=average, sessions_count=len(sessions), stress_category=categorize_stress(average))
        saved = load_data('saved_combined_results.json')
        saved = [entry for entry in saved if (entry['start_date'], entry['end_date']) != (result['start_date'], result['end_date'])]
        save_data(saved + [result], 'saved_combined_results.json')
    return jsonify(result), 200
