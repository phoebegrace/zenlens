from io import BytesIO
import importlib.util
import sys
from pathlib import Path
import hashlib
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src' / 'server'))
pytestmark = pytest.mark.skipif(importlib.util.find_spec('tensorflow') is None, reason='TensorFlow inference environment required')


def image_upload(name='classroom.jpg'):
    from PIL import Image
    from werkzeug.datastructures import FileStorage
    stream = BytesIO()
    Image.new('RGB', (80, 80), (100, 120, 140)).save(stream, 'JPEG')
    stream.seek(0)
    return FileStorage(stream, filename=name)


def test_bundled_model_produces_seven_probabilities():
    import numpy as np
    from services.model_loader import get_model
    result = get_model()(np.zeros((1, 48, 48, 1), dtype=np.float32), training=False).numpy()
    assert result.shape == (1, 7)
    assert np.isfinite(result).all()
    assert abs(float(result.sum()) - 1) < 1e-5


def test_zero_faces_is_not_reported_as_normal(tmp_path, monkeypatch):
    from app import create_app
    from flask import g
    from services.image_processing import process_and_save_images, RetinaFace
    monkeypatch.setattr(RetinaFace, 'detect_faces', lambda *_args, **_kwargs: ())
    app = create_app()
    app.config['DATA_ROOT'] = tmp_path
    with app.test_request_context():
        g.user_key = hashlib.sha256(b'alice').hexdigest()
        result = process_and_save_images([image_upload('../../escape.jpg')], 'safe-session', '2026-10-19')
        assert result['total_faces'] == 0
        assert result['stress_category'] == 'Unavailable'
        assert result['folder_path'] == 'uploads/safe-session/processed'
        assert len(list(tmp_path.rglob('*escape.jpg'))) == 2  # original + annotated, both inside user/session folders
        assert not (tmp_path.parent / 'escape.jpg').exists()


def test_analysis_with_detected_face_uses_real_model(tmp_path, monkeypatch):
    from app import create_app
    from flask import g
    from services.image_processing import process_and_save_images, RetinaFace
    monkeypatch.setattr(RetinaFace, 'detect_faces', lambda *_args, **_kwargs: {'face_1': {'facial_area': [10, 10, 60, 60]}})
    app = create_app()
    app.config['DATA_ROOT'] = tmp_path
    with app.test_request_context():
        g.user_key = hashlib.sha256(b'alice').hexdigest()
        result = process_and_save_images([image_upload()], 'test-session', '2026-10-19')
        assert result['total_faces'] == 1
        assert 0 <= result['average_stress'] <= 100
        assert result['details'][0]['results']['Face 1']['emotion'] in ['angry','disgust','afraid','happy','neutral','sad','surprise']


def test_fake_image_content_is_rejected(tmp_path):
    from app import create_app
    from flask import g
    from werkzeug.datastructures import FileStorage
    from services.image_processing import process_and_save_images
    app = create_app()
    app.config['DATA_ROOT'] = tmp_path
    with app.test_request_context():
        g.user_key = hashlib.sha256(b'alice').hexdigest()
        with pytest.raises(ValueError, match='invalid'):
            process_and_save_images([FileStorage(BytesIO(b'not-an-image'), filename='fake.jpg')], 'test', '2026-10-19')


def test_large_photo_bounds_detector_input_and_restores_coordinates(tmp_path, monkeypatch):
    import cv2
    import numpy as np
    from services import image_processing as processing
    path = tmp_path / 'large.jpg'
    cv2.imwrite(str(path), np.zeros((1200, 1600, 3), dtype=np.uint8))
    output = tmp_path / 'processed'
    output.mkdir()

    def detector(image, **kwargs):
        assert max(image.shape[:2]) <= 640
        assert kwargs.get('allow_upscaling') is False
        return {'face_1': {'facial_area': [40, 40, 120, 120]}}

    monkeypatch.setattr(processing.RetinaFace, 'detect_faces', detector)
    monkeypatch.setattr(processing, 'predict_emotion', lambda _: np.array([[0, 0, 0, 1, 0, 0, 0]]))
    saved, faces, _ = processing.analyze_image(str(path), str(output))
    assert faces['Face 1']['coordinates'] == (100, 100, 200, 200)
    assert cv2.imread(saved).shape[:2] == (1200, 1600)
