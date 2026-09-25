from flask import Blueprint, jsonify
import json
from datetime import datetime, timedelta
import logging

from services.data_handler import (
    load_emotion_timeline,
    save_daily_results,
)
from config import EMOTION_TIMELINE_FILE

logger = logging.getLogger(__name__)

timeline_bp = Blueprint("timeline_bp", __name__)


@timeline_bp.route("/emotion-timeline", methods=["GET"])
def get_emotion_timeline():
    try:
        with open(EMOTION_TIMELINE_FILE, "r") as file:
            emotion_timeline = json.load(file)

        return jsonify(emotion_timeline)

    except FileNotFoundError:
        return jsonify(
            {"error": "Emotion timeline data not found"}
        ), 404

    except json.JSONDecodeError:
        return jsonify(
            {"error": "Error decoding JSON data"}
        ), 500


@timeline_bp.route("/daily-emotion-timeline", methods=["GET"])
def daily_emotion_timeline():
    data = load_emotion_timeline()

    daily_summary = {}

    for entry in data:
        date = entry.get(
            "analysis_date",
            entry["timestamp"].split("T")[0],
        )

        if date not in daily_summary:
            daily_summary[date] = []

        daily_summary[date].append(
            {
                "timestamp": entry["timestamp"],
                "emotion_counts": entry["emotion_counts"],
            }
        )

    daily_results = [
        {
            "date": date,
            "entries": entries,
        }
        for date, entries in daily_summary.items()
    ]

    save_daily_results(daily_results)

    return jsonify(daily_results)


@timeline_bp.route("/weekly-emotion-timeline", methods=["GET"])
def weekly_emotion_timeline():
    data = load_emotion_timeline()

    data.sort(
        key=lambda entry: datetime.fromisoformat(
            entry["timestamp"]
        )
    )

    weekly_summary = []

    current_week = []
    current_start_date = None

    for entry in data:
        entry_date = datetime.fromisoformat(
            entry["timestamp"]
        )

        if current_start_date is None:
            current_start_date = entry_date

        if (
            entry_date - current_start_date
            < timedelta(days=7)
        ):
            current_week.append(entry)

        else:
            weekly_summary.append(current_week)

            current_week = [entry]
            current_start_date = entry_date

    if current_week:
        weekly_summary.append(current_week)

    weekly_results = []

    for week in weekly_summary:
        start_date = (
            week[0]["timestamp"]
            .split("T")[0]
        )

        end_date = (
            week[-1]["timestamp"]
            .split("T")[0]
        )

        weekly_entries = [
            {
                "timestamp": entry["timestamp"],
                "emotion_counts": entry["emotion_counts"],
            }
            for entry in week
        ]

        weekly_results.append(
            {
                "week": (
                    f"{start_date} - "
                    f"{end_date}"
                ),
                "entries": weekly_entries,
            }
        )

    return jsonify(weekly_results)