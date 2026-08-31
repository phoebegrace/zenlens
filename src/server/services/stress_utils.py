import requests
import logging
from datetime import datetime, timedelta

from config import OPENAI_API_KEY, WEEKLY_RESULTS_FILE
from services.data_handler import load_data, save_weekly_results

logger = logging.getLogger(__name__)


def categorize_stress(average_stress):
    adjusted_stress = (average_stress / 100) * 21

    if adjusted_stress <= 7:
        return "Normal"
    elif adjusted_stress <= 9:
        return "Mild"
    elif adjusted_stress <= 12:
        return "Moderate"
    elif adjusted_stress <= 16:
        return "Severe"
    else:
        return "Extremely Severe"


def get_openai_response(average_stress, stress_category):
    try:
        if not OPENAI_API_KEY:
            logger.error("OPENAI_API_KEY is not available.")
            return "Unable to fetch recommendation because the OpenAI API key is not configured."

        if stress_category == "Extremely Severe":
            return (
                "The average stress level is extremely high. "
                "It is highly recommended to intervene with the class immediately."
            )

        category_message = (
            f"The stress level this week is: {stress_category}.\n\n"
        )

        prompt = (
            f"The average stress level is {average_stress:.2f}%, "
            f"which falls under the '{stress_category}' category. "
            "Provide some recommendations or insights based on this stress level."
        )

        url = "https://api.openai.com/v1/chat/completions"

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}",
        }

        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an empathetic helpful assistant.",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            "max_tokens": 100,
            "temperature": 0.7,
        }

        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=30,
        )

        if response.status_code != 200:
            logger.error(
                "OpenAI API call failed with status code %s: %s",
                response.status_code,
                response.text,
            )

            return "Unable to fetch recommendation at this time."

        data = response.json()

        response_content = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )

        if not response_content:
            logger.error("Received empty response content from OpenAI API.")

            return "OpenAI API returned an empty response."

        return f"{category_message}Advice: {response_content}"

    except requests.exceptions.Timeout:
        logger.error("Request to OpenAI API timed out.")

        return "The request to OpenAI API timed out. Please try again later."

    except requests.exceptions.RequestException as e:
        logger.error(
            "RequestException while fetching recommendation: %s",
            str(e),
        )

        return "Unable to fetch recommendation at this time due to a network error."

    except Exception as e:
        logger.error(
            "Unexpected error fetching recommendation from OpenAI API: %s",
            str(e),
            exc_info=True,
        )

        return "Unable to fetch recommendation at this time."


def group_by_week(data):
    data.sort(
        key=lambda x: datetime.strptime(
            x["date"],
            "%Y-%m-%d",
        )
    )

    grouped_data = []
    current_week = []
    current_start_date = None

    for entry in data:
        entry_date = datetime.strptime(
            entry["date"],
            "%Y-%m-%d",
        )

        if current_start_date is None:
            current_start_date = entry_date

        if entry_date - current_start_date < timedelta(days=7):
            current_week.append(entry)

        else:
            grouped_data.append(current_week)

            current_week = [entry]
            current_start_date = entry_date

    if current_week:
        grouped_data.append(current_week)

    return grouped_data


def calculate_weekly_averages(grouped_data):
    weekly_averages = []

    for week in grouped_data:
        total_faces = sum(
            entry["total_faces"]
            for entry in week
        )

        total_stress = sum(
            entry["average_stress"] * entry["total_faces"]
            for entry in week
        )

        sessions_count = len(week)

        average_stress = (
            total_stress / total_faces
            if total_faces > 0
            else 0
        )

        stress_category = categorize_stress(
            average_stress
        )

        try:
            openai_response = get_openai_response(
                average_stress,
                stress_category,
            )

            logger.info(
                "OpenAI Response: %s",
                openai_response,
            )

            logger.info(
                "Type of OpenAI Response: %s",
                type(openai_response),
            )

            if not isinstance(
                openai_response,
                str,
            ):
                logger.error(
                    "Unexpected OpenAI response type: %s",
                    type(openai_response),
                )

                openai_response = (
                    "Error: Unexpected OpenAI response type"
                )

        except Exception as e:
            openai_response = (
                f"Could not get OpenAI response: {e}"
            )

        weekly_averages.append(
            {
                "week": (
                    f"{week[0]['date']} - "
                    f"{week[-1]['date']}"
                ),
                "total_faces": total_faces,
                "average_stress": average_stress,
                "stress_category": stress_category,
                "sessions_count": sessions_count,
                "openai_response": openai_response,
            }
        )

    return weekly_averages


def update_weekly_results():
    data = load_data()

    grouped_data = group_by_week(
        data
    )

    weekly_averages = calculate_weekly_averages(
        grouped_data
    )

    save_weekly_results(
        weekly_averages,
        WEEKLY_RESULTS_FILE,
    )