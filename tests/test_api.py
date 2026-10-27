import importlib
import sys
from pathlib import Path
from types import ModuleType

import pytest

SERVER = Path(__file__).resolve().parents[1] / 'src' / 'server'
sys.path.insert(0, str(SERVER))
from app import create_app


def test_history_requires_authentication():
    app = create_app()
    app.config['TESTING'] = True
    response = app.test_client().get('/history')
    assert response.status_code == 401

@pytest.fixture
def app(tmp_path, monkeypatch):
    app = create_app()
    app.config.update(TESTING=True, DATA_ROOT=tmp_path)
    import services.security as security
    monkeypatch.setattr(security, 'verify_token', lambda token: token if token in {'alice', 'bob'} else (_ for _ in ()).throw(ValueError()))
    return app


def headers(user='alice'):
    return {'Authorization': f'Bearer {user}'}


def test_user_history_is_isolated(app):
    from flask import g
    from services.data_handler import save_data
    import hashlib
    with app.test_request_context():
        g.user_key = hashlib.sha256(b'alice').hexdigest()
        save_data([{'date': '2026-10-19', 'subject': 'Math'}])
    client = app.test_client()
    assert len(client.get('/api/history', headers=headers()).json) == 1
    assert client.get('/api/history', headers=headers('bob')).json == []


def test_bad_date_is_rejected_before_processing(app):
    from io import BytesIO
    response = app.test_client().post('/api/analyze', headers=headers(), data={
        'date': '../../escape', 'teacher': 'A', 'subject': 'Math', 'weather': 'Clear',
        'startTime': '08:00', 'endTime': '09:00', 'folder': (BytesIO(b'x'), 'image.jpg')})
    assert response.status_code == 400


def test_processed_directory_cannot_escape_user_namespace(app, tmp_path):
    sibling = tmp_path / 'uploads-secret'
    sibling.mkdir()
    (sibling / 'secret.jpg').write_bytes(b'private')
    response = app.test_client().get('/api/processed/secret.jpg', query_string={'folder_path': str(sibling)}, headers=headers())
    assert response.status_code == 403


def test_daily_timeline_get_does_not_duplicate_saved_results(app):
    from flask import g
    from services.data_handler import save_data, load_data
    import hashlib
    key = hashlib.sha256(b'alice').hexdigest()
    with app.test_request_context():
        g.user_key = key
        save_data([{'timestamp': '2026-10-19T08:00:00', 'emotion_counts': {'happy': 1}}], 'emotion_timeline.json')
    client = app.test_client()
    client.get('/api/daily-emotion-timeline', headers=headers())
    client.get('/api/daily-emotion-timeline', headers=headers())
    with app.test_request_context():
        g.user_key = key
        assert len(load_data('daily_emotion_timeline.json')) == 1


def test_save_combined_results_endpoint_exists(app):
    response = app.test_client().post('/api/save-combined-results', headers=headers(), json={'start_date': '2026-10-01', 'end_date': '2026-10-19'})
    assert response.status_code == 400  # no sessions in that range, rather than a missing endpoint


def test_expired_or_invalid_token_rejected(app):
    assert app.test_client().get('/api/history', headers=headers('invalid')).status_code == 401


def test_api_does_not_allow_cookie_only_mutation(app):
    client = app.test_client()
    client.set_cookie('astra_image_auth', 'alice')
    assert client.post('/api/analyze').status_code == 401
