from flask import Blueprint, request, jsonify
from datetime import datetime
import logging

from services.data_handler import load_data

logger = logging.getLogger(__name__)

history_bp = Blueprint('history_bp', __name__)

@history_bp.route('/history', methods=['GET'])
def history():
    subject = request.args.get('subject', '').lower()
    teacher = request.args.get('teacher', '').lower()
    weather = request.args.get('weather', '').lower()
    sort_order = request.args.get('sort_order', 'latest')

    data = load_data()

    if subject:
        data = [entry for entry in data if subject in entry.get('subject', '').lower()]
    if teacher:
        data = [entry for entry in data if teacher in entry.get('teacher', '').lower()]
    if weather:
        data = [entry for entry in data if weather in entry.get('weather', '').lower()]

    if sort_order == 'latest':
        data.sort(key=lambda x: datetime.strptime(x['date'], '%Y-%m-%d'), reverse=True)
    else:
        data.sort(key=lambda x: datetime.strptime(x['date'], '%Y-%m-%d'))

    return jsonify(data)