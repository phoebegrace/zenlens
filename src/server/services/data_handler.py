"""User-scoped storage, atomic writes, and process-safe update locks."""
import json
import os
import tempfile
from pathlib import Path

from filelock import FileLock
from flask import g, current_app
from config import DATA_FILE, EMOTION_TIMELINE_FILE, WEEKLY_RESULTS_FILE, DATA_ROOT


def user_root():
    root = Path(current_app.config.get('DATA_ROOT', DATA_ROOT)) / 'users' / g.user_key
    root.mkdir(parents=True, exist_ok=True)
    return root


def data_path(file_path):
    # Only logical filenames are accepted; callers cannot escape their namespace.
    return user_root() / Path(file_path).name


def user_lock():
    return FileLock(str(user_root() / '.analysis.lock'), timeout=600)


def load_data(file_path=DATA_FILE):
    path = data_path(file_path)
    if not path.exists():
        return []
    with path.open() as handle:
        data = json.load(handle)
    return data if isinstance(data, list) else []


def save_data(data, file_path=DATA_FILE):
    path = data_path(file_path)
    fd, temporary = tempfile.mkstemp(dir=path.parent, suffix='.tmp')
    try:
        with os.fdopen(fd, 'w') as handle:
            json.dump(data, handle, indent=2, allow_nan=False)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def load_emotion_timeline(file_path=EMOTION_TIMELINE_FILE):
    return load_data(file_path)


def save_emotion_timeline(new_entries, file_path=EMOTION_TIMELINE_FILE):
    with FileLock(str(data_path(file_path)) + '.lock'):
        save_data(load_data(file_path) + new_entries, file_path)


def load_weekly_results(file_path=WEEKLY_RESULTS_FILE):
    return load_data(file_path)


def save_weekly_results(data, file_path=WEEKLY_RESULTS_FILE):
    save_data(data, file_path)


def save_daily_results(results, file_path='daily_emotion_timeline.json'):
    # A derived snapshot is replaced, never appended on every GET.
    save_data(results, file_path)
