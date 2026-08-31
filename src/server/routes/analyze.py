from flask import Blueprint, request, jsonify
import os
import logging

from services.data_handler import load_data, save_data
from services.image_processing import process_and_save_images
from services.stress_utils import update_weekly_results
from config import UPLOAD_FOLDER

logger = logging.getLogger(__name__)

analyze_bp = Blueprint('analyze_bp', __name__)

@analyze_bp.route('/analyze', methods=['POST'])
def analyze():
    try:
        weather = request.form.get('weather')
        if not weather:
            logger.error('Weather value is missing')
            
        subject = request.form.get('subject')
        if not subject:
            logger.error('Subject value is missing')
            
        teacher = request.form.get('teacher')
        if not teacher:
            logger.error('Teacher value is missing')
            
        date = request.form.get('date')
        if not date:
            logger.error('Date value is missing')
            
        startTime = request.form.get('startTime')  # Ensure the correct key
        endTime = request.form.get('endTime')  # Ensure the correct key

        if 'folder' not in request.files:
            return jsonify({"error": "No folder part"}), 400

        files = request.files.getlist('folder')  # Get all files in the folder
        logger.info(f"Received {len(files)} files for processing.")

        # Load existing data to determine session number
        data = load_data()
        date_sessions = [entry for entry in data if entry['date'] == date]
        session_number = len(date_sessions) + 1  # Increment session number based on existing entries
        session_id = f"{date}_{session_number}"

        os.makedirs(os.path.join(UPLOAD_FOLDER, session_id), exist_ok=True)

        # Process the files in batch
        results = process_and_save_images(files, session_id, date)
        
        logger.info(f"Results to return: {results}")
        if not results:
            logger.error("No results generated from processing")
            return jsonify({"error": "Image Processing Error"}), 500

        # Save the new analysis result
        data.append({
            'session_id': session_id,
            'session': session_number,
            'subject': subject,
            'weather': weather,
            'teacher': teacher,
            'date': date,
            'startTime': startTime,  # Ensure correct key
            'endTime': endTime,  # Ensure correct key
            'total_faces': results.get('total_faces', 0),
            'average_stress': results.get('average_stress', 0.0),
            'stress_category': results['stress_category']  # Add stress category to the saved data
        })

        save_data(data)  # Save the updated data
        update_weekly_results()

        response = jsonify(results)
        logger.info(f"Returning response: {response.get_json()}")
        return response, 200

    except Exception as e:
        logger.error(f"Error in /analyze route: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500