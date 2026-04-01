"""
Migration script: Move all media from Object Storage to Cloudinary.
Run once on production to migrate existing images and videos.

Usage: python3 migrate_to_cloudinary.py
"""
import os
import sys
import time
import cloudinary
import cloudinary.uploader
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')

# Init Cloudinary
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True,
)

# Init MongoDB
client = MongoClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
db_name = os.environ.get("DB_NAME", "wm_group")
db = client[db_name]

# Init Object Storage
try:
    from object_storage import init_storage, get_object
    init_storage()
    HAS_OBJSTORE = True
except Exception as e:
    print(f"[WARN] Object Storage not available: {e}")
    HAS_OBJSTORE = False


def migrate_images():
    """Migrate images from Object Storage/MongoDB to Cloudinary."""
    images = list(db.uploads.find({"cloudinary_url": {"$exists": False}}))
    total = len(images)
    print(f"\n=== Migrating {total} images ===")

    success = 0
    errors = 0
    for i, img in enumerate(images, 1):
        img_id = img["id"]
        print(f"  [{i}/{total}] Image {img_id}...", end=" ", flush=True)

        # Get image data
        data = None
        if img.get("storage_path") and HAS_OBJSTORE:
            try:
                data, _ = get_object(img["storage_path"])
            except Exception as e:
                print(f"ObjStore error: {e}", end=" ")
        if data is None and img.get("data"):
            import base64
            data = base64.b64decode(img["data"])

        if data is None:
            print("SKIP (no data)")
            errors += 1
            continue

        # Upload to Cloudinary
        try:
            result = cloudinary.uploader.upload(
                data,
                folder="wm-group/images",
                public_id=img_id,
                resource_type="image",
                overwrite=True,
            )
            cld_url = result["secure_url"]
            db.uploads.update_one(
                {"_id": img["_id"]},
                {"$set": {"cloudinary_url": cld_url, "cloudinary_public_id": result["public_id"]}}
            )
            print(f"OK → {cld_url[:60]}...")
            success += 1
        except Exception as e:
            print(f"ERROR: {e}")
            errors += 1

        # Rate limit
        time.sleep(0.3)

    print(f"\nImages: {success} migrated, {errors} errors, {total} total")
    return success, errors


def migrate_videos():
    """Migrate videos from Object Storage/filesystem to Cloudinary."""
    videos = list(db.video_uploads.find({"cloudinary_url": {"$exists": False}}))
    total = len(videos)
    print(f"\n=== Migrating {total} videos ===")

    success = 0
    errors = 0
    for i, vid in enumerate(videos, 1):
        vid_id = vid["id"]
        print(f"  [{i}/{total}] Video {vid_id}...", end=" ", flush=True)

        # Get video data
        data = None
        # Try filesystem first
        fs_path = Path(f"/app/backend/uploads/videos/{vid_id}.mp4")
        if fs_path.exists():
            data = fs_path.read_bytes()
        elif vid.get("storage_path") and HAS_OBJSTORE:
            try:
                data, _ = get_object(vid["storage_path"])
            except Exception as e:
                print(f"ObjStore error: {e}", end=" ")

        if data is None:
            print("SKIP (no data)")
            errors += 1
            continue

        size_mb = len(data) / (1024 * 1024)
        print(f"({size_mb:.1f}MB)...", end=" ", flush=True)

        # Upload to Cloudinary (videos can be large, increase timeout)
        try:
            result = cloudinary.uploader.upload(
                data,
                folder="wm-group/videos",
                public_id=vid_id,
                resource_type="video",
                overwrite=True,
                timeout=300,
            )
            cld_url = result["secure_url"]
            db.video_uploads.update_one(
                {"_id": vid["_id"]},
                {"$set": {"cloudinary_url": cld_url, "cloudinary_public_id": result["public_id"]}}
            )
            print(f"OK → {cld_url[:60]}...")
            success += 1
        except Exception as e:
            print(f"ERROR: {e}")
            errors += 1

        time.sleep(1)  # Rate limit for large files

    print(f"\nVideos: {success} migrated, {errors} errors, {total} total")
    return success, errors


def migrate_settings_urls():
    """Update settings that reference /api/images/ or /api/videos/ to use Cloudinary URLs."""
    # Build lookup map
    img_map = {}
    for doc in db.uploads.find({"cloudinary_url": {"$exists": True}}, {"id": 1, "cloudinary_url": 1}):
        img_map[doc["id"]] = doc["cloudinary_url"]

    vid_map = {}
    for doc in db.video_uploads.find({"cloudinary_url": {"$exists": True}}, {"id": 1, "cloudinary_url": 1}):
        vid_map[doc["id"]] = doc["cloudinary_url"]

    if not img_map and not vid_map:
        print("\nNo Cloudinary URLs to update in settings")
        return

    print(f"\n=== Updating settings URLs ({len(img_map)} images, {len(vid_map)} videos) ===")

    import json
    updated = 0
    for doc in db.settings.find({}):
        original = json.dumps(doc, default=str)
        modified = original

        for img_id, cld_url in img_map.items():
            modified = modified.replace(f"/api/images/{img_id}", cld_url)
        for vid_id, cld_url in vid_map.items():
            modified = modified.replace(f"/api/videos/{vid_id}.mp4", cld_url)

        if modified != original:
            new_doc = json.loads(modified)
            new_doc.pop("_id", None)
            db.settings.update_one({"_id": doc["_id"]}, {"$set": new_doc})
            updated += 1
            print(f"  Updated settings: {doc.get('id', 'unknown')}")

    print(f"Settings updated: {updated}")


if __name__ == "__main__":
    print("=" * 50)
    print("WM Group — Cloudinary Migration")
    print("=" * 50)
    print(f"Cloud: {os.environ.get('CLOUDINARY_CLOUD_NAME')}")
    print(f"MongoDB: {db_name}")

    img_s, img_e = migrate_images()
    vid_s, vid_e = migrate_videos()
    migrate_settings_urls()

    print("\n" + "=" * 50)
    print(f"DONE: {img_s + vid_s} files migrated, {img_e + vid_e} errors")
    print("=" * 50)
