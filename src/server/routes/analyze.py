from datetime import datetime
import logging
from uuid import uuid4
from flask import Blueprint, request, jsonify
from filelock import Timeout

from services.data_handler import load_data, save_data, user_lock
from services.stress_utils import update_weekly_results

logger = logging.getLogger(__name__)
analyze_bp = Blueprint('analyze_bp', __name__)


@analyze_bp.route('/analyze', methods=['POST'])
def analyze():
    fields = {key: request.form.get(key, '').strip() for key in
              ('weather', 'subject', 'teacher', 'date', 'startTime', 'endTime')}
    if any(not value or len(value) > 200 for value in fields.values()):
        return jsonify(error='Complete all classroom and session fields.'), 400
    try:
        parsed = datetime.strptime(fields['date'], '%Y-%m-%d')
        if parsed.strftime('%Y-%m-%d') != fields['date']:
            raise ValueError()
        start = datetime.strptime(fields['startTime'], '%H:%M')
        end = datetime.strptime(fields['endTime'], '%H:%M')
        if end <= start:
            raise ValueError()
    except ValueError:
        return jsonify(error='Enter a valid session date and an end time after the start time.'), 400
    files = request.files.getlist('folder')
    if not files or len(files) > 100:
        return jsonify(error='Upload between 1 and 100 JPG or PNG images.'), 400

    try:
        # Import only when needed; static pages and health checks start without
        # downloading detection weights or allocating TensorFlow model memory.
        from services.image_processing import process_and_save_images
        with user_lock():
            data = load_data()
            session_number = 1 + max((entry.get('session', 0) for entry in data
                                      if entry.get('date') == fields['date']), default=0)
            session_id = f"{fields['date']}_{session_number}_{uuid4().hex[:12]}"
            results = process_and_save_images(files, session_id, fields['date'])
            if not results.get('total_faces'):
                return jsonify(error='No faces were detected. Try clearer classroom images.'), 422
            data.append(dict(fields, session_id=session_id, session=session_number,
                             total_faces=results['total_faces'], average_stress=results['average_stress'],
                             stress_category=results['stress_category']))
            save_data(data)
            update_weekly_results()
        return jsonify(results), 200
    except ValueError as error:
        return jsonify(error=str(error)), 400
    except Timeout:
        return jsonify(error='Another analysis is running. Please try again shortly.'), 409
    except Exception:
        logger.exception('Analysis failed')
        return jsonify(error='ASTRA could not analyze these images. Please try again.'), 500
