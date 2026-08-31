from flask import Blueprint, request, jsonify, send_from_directory
import os
import logging

from services.data_handler import load_data, load_weekly_results, save_weekly_results
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
        directory = os.path.dirname(os.path.abspath(WEEKLY_RESULTS_FILE))
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
    uploads_abs = os.path.abspath("uploads")
    folder_abs = os.path.abspath(folder_path)
    if not folder_abs.startswith(uploads_abs):
        return jsonify({"error": "Invalid folder path"}), 403
    try:
        return send_from_directory(folder_abs, filename)
    except Exception as e:
        logger.error(f"Error serving processed image: {str(e)}")
        return jsonify({"error": "Unable to fetch processed image."}), 404