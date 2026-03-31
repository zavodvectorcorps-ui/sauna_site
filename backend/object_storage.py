import os
import requests
import logging

logger = logging.getLogger(__name__)

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = "wm-group"
storage_key = None


def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    emergent_key = os.environ.get("EMERGENT_LLM_KEY")
    if not emergent_key:
        raise RuntimeError("EMERGENT_LLM_KEY not set")
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": emergent_key}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    logger.info("Object storage initialized successfully")
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=180
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str, retries: int = 3):
    key = init_storage()
    for attempt in range(retries):
        try:
            resp = requests.get(
                f"{STORAGE_URL}/objects/{path}",
                headers={"X-Storage-Key": key}, timeout=30
            )
            resp.raise_for_status()
            return resp.content, resp.headers.get("Content-Type", "application/octet-stream")
        except (requests.exceptions.RequestException, Exception) as e:
            if attempt < retries - 1:
                import time
                time.sleep(0.5 * (attempt + 1))
                logger.warning(f"Object storage retry {attempt+1}/{retries} for {path}: {e}")
            else:
                raise


MIME_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "gif": "image/gif", "webp": "image/webp", "mp4": "video/mp4",
    "pdf": "application/pdf", "svg": "image/svg+xml",
}


def get_mime_type(filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "bin"
    return MIME_TYPES.get(ext, "application/octet-stream")
