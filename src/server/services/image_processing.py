import os
import cv2
import numpy as np
from retinaface import RetinaFace
from datetime import datetime
from PIL import Image
from PIL.ExifTags import TAGS
import logging

from services.model_loader import model, emotion_labels, emotion_scores, max_score
from config import IMAGE_SIZE, NORMALIZATION_FACTOR, UPLOAD_FOLDER, PROCESSED_FOLDER
from services.data_handler import save_emotion_timeline
from services.stress_utils import categorize_stress

logger = logging.getLogger(__name__)


EMOTION_SHORT_LABELS = {
    "Neutral": "NEU",
    "Happy": "HAP",
    "Happiness": "HAP",
    "Sad": "SAD",
    "Sadness": "SAD",
    "Angry": "ANG",
    "Anger": "ANG",
    "Fear": "FEA",
    "Fearful": "FEA",
    "Disgust": "DIS",
    "Surprise": "SUR",
}


def shorten_emotion_label(emotion: str) -> str:
    if not emotion:
        return "UNK"

    if emotion in EMOTION_SHORT_LABELS:
        return EMOTION_SHORT_LABELS[emotion]

    normalized = str(emotion).strip()

    if not normalized:
        return "UNK"

    return normalized[:3].upper()


def preprocess_image(gray: np.ndarray) -> np.ndarray:
    resized = cv2.resize(
        gray,
        (IMAGE_SIZE, IMAGE_SIZE),
        interpolation=cv2.INTER_AREA
    )

    normalized = resized / NORMALIZATION_FACTOR

    processed_image = np.expand_dims(
        normalized,
        axis=-1
    )

    processed_image = np.expand_dims(
        processed_image,
        axis=0
    )

    return processed_image


def predict_emotion(processed_image: np.ndarray) -> np.ndarray:
    return model.predict(processed_image)


def classify_emotions(probabilities: np.ndarray) -> (str, int):
    detected_emotion_index = np.argmax(probabilities)

    detected_emotion = emotion_labels[
        detected_emotion_index
    ]

    stress_score = emotion_scores[
        detected_emotion
    ]

    return detected_emotion, stress_score


def extract_timestamp(image_path: str) -> str:
    try:
        image = Image.open(image_path)

        exif_data = image._getexif()

        if exif_data:
            for tag, value in exif_data.items():
                decoded_tag = TAGS.get(
                    tag,
                    tag
                )

                if decoded_tag == "DateTime":
                    return datetime.strptime(
                        value,
                        "%Y:%m:%d %H:%M:%S"
                    ).isoformat()

    except Exception as e:
        logger.warning(
            f"Could not extract EXIF data from "
            f"{image_path}: {e}"
        )

    mod_time = os.path.getmtime(
        image_path
    )

    return datetime.fromtimestamp(
        mod_time
    ).isoformat()


def analyze_image(
    image_path: str,
    output_folder: str
) -> dict:
    try:
        logger.info(
            f"Analyzing image: {image_path}"
        )

        image = cv2.imread(
            image_path
        )

        if image is None or image.size == 0:
            raise ValueError(
                f"Image is empty or corrupted "
                f"at path: {image_path}"
            )

        rgb_image = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2RGB
        )

        faces = RetinaFace.detect_faces(
            rgb_image
        )

        stress_results = {}

        emotion_counts = {
            emotion: 0
            for emotion in emotion_labels
        }

        for i, face_key in enumerate(
            faces.keys()
        ):
            face = faces[
                face_key
            ]

            facial_area = face[
                "facial_area"
            ]

            x, y, x2, y2 = facial_area

            cropped_face = rgb_image[
                y:y2,
                x:x2
            ]

            gray_face = cv2.cvtColor(
                cropped_face,
                cv2.COLOR_RGB2GRAY
            )

            processed_image = preprocess_image(
                gray_face
            )

            probabilities = predict_emotion(
                processed_image
            )

            detected_emotion, stress_score = classify_emotions(
                probabilities
            )

            stress_results[
                f"Face {i + 1}"
            ] = {
                "emotion": detected_emotion,
                "stress_score": int(
                    stress_score
                ),
                "coordinates": (
                    int(x),
                    int(y),
                    int(x2 - x),
                    int(y2 - y)
                )
            }

            emotion_counts[
                detected_emotion
            ] += 1

            short_emotion = shorten_emotion_label(
                detected_emotion
            )

            cv2.rectangle(
                image,
                (x, y),
                (x2, y2),
                (57, 255, 20),
                2
            )

            face_label = (
                f"F-{i + 1}"
            )

            cv2.putText(
                image,
                face_label,
                (x, y - 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.6,
                (57, 255, 20),
                2
            )

            cv2.putText(
                image,
                short_emotion,
                (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.6,
                (57, 255, 20),
                2
            )

        output_path = os.path.join(
            output_folder,
            os.path.basename(
                image_path
            )
        )

        cv2.imwrite(
            output_path,
            image
        )

        logger.info(
            f"Processed image saved at: "
            f"{output_path}"
        )

        timestamp = extract_timestamp(
            image_path
        )

        return (
            output_path,
            stress_results,
            {
                "timestamp": timestamp,
                "emotion_counts": emotion_counts
            }
        )

    except Exception as e:
        logger.error(
            f"Error analyzing image "
            f"{image_path}: {e}"
        )

        raise


def process_and_save_images(
    files,
    session_id: str,
    analysis_date: str
) -> dict:
    total_stress = 0

    total_faces = 0

    stress_results = []

    emotion_timeline = []

    session_folder = os.path.join(
        UPLOAD_FOLDER,
        session_id
    )

    processed_folder = os.path.join(
        session_folder,
        PROCESSED_FOLDER
    )

    os.makedirs(
        processed_folder,
        exist_ok=True
    )

    for file in files:
        filename = file.filename

        if filename.lower().endswith(
            (
                ".png",
                ".jpg",
                ".jpeg"
            )
        ):
            image_path = os.path.join(
                session_folder,
                filename
            )

            os.makedirs(
                os.path.dirname(
                    image_path
                ),
                exist_ok=True
            )

            file.save(
                image_path
            )

            try:
                output_path, results, emotion_data = analyze_image(
                    image_path,
                    processed_folder
                )

                photo_total_stress = sum(
                    result[
                        "stress_score"
                    ]
                    for result
                    in results.values()
                )

                total_stress += (
                    photo_total_stress
                )

                total_faces += len(
                    results
                )

                stress_results.append(
                    {
                        "filename": filename,

                        "processed_image":
                            output_path,

                        "results": {
                            key: {
                                k: (
                                    int(v)
                                    if isinstance(
                                        v,
                                        np.int32
                                    )
                                    else v
                                )
                                for k, v
                                in res.items()
                            }
                            for key, res
                            in results.items()
                        },

                        "total_stress": int(
                            photo_total_stress
                        )
                    }
                )

                emotion_timeline.append(
                    {
                        "session_id":
                            session_id,

                        "analysis_date":
                            analysis_date,

                        "timestamp":
                            emotion_data[
                                "timestamp"
                            ],

                        "emotion_counts":
                            emotion_data[
                                "emotion_counts"
                            ]
                    }
                )

            except Exception as e:
                logger.error(
                    f"Error processing image "
                    f"{filename}: {e}"
                )

                continue

    average_stress = (
        (
            total_stress
            /
            (
                total_faces
                *
                max_score
            )
            *
            100
        )
        if total_faces > 0
        else 0
    )

    stress_category = categorize_stress(
        average_stress
    )

    save_emotion_timeline(
        emotion_timeline
    )

    return {
        "total_stress":
            total_stress,

        "total_faces":
            total_faces,

        "average_stress":
            average_stress,

        "stress_category":
            stress_category,

        "details":
            stress_results,

        "folder_path":
            processed_folder
    }