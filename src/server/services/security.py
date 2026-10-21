"""Verify Firebase ID tokens; no admin/service-account key is required."""
import hashlib
import threading

from flask import g, request
from google.auth.transport.requests import Request
from google.oauth2.id_token import verify_firebase_token
from cachecontrol import CacheControl
import requests

from config import FIREBASE_PROJECT_ID

_http = Request(session=CacheControl(requests.Session()))
_verify_lock = threading.Lock()


def verify_token(token):
    with _verify_lock:
        claims = verify_firebase_token(token, _http, audience=FIREBASE_PROJECT_ID)
    uid = claims.get('sub')
    if not isinstance(uid, str) or not uid or len(uid) > 128:
        raise ValueError('Invalid identity')
    return uid


def authenticate():
    header = request.headers.get('Authorization', '')
    token = header[7:] if header.startswith('Bearer ') else ''
    # Images cannot attach Authorization headers. Only that read-only route may
    # use the short-lived, HttpOnly ID-token cookie set by an authorized API call.
    image_request = request.endpoint in {'results_bp.get_processed_image', 'api_results_bp.get_processed_image'}
    if not token and image_request:
        token = request.cookies.get('astra_image_auth', '')
    if not token:
        return False
    try:
        g.user_id = verify_token(token)
        g.user_key = hashlib.sha256(g.user_id.encode()).hexdigest()
        if header.startswith('Bearer '):
            g.image_token = token
        return True
    except Exception:
        return False
