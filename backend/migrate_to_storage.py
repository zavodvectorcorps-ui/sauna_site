"""Migrate existing images (from MongoDB) and videos (from filesystem) to object storage."""
import asyncio
import os
import base64
import glob
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).parent / '.env')
from object_storage import init_storage, put_object, get_mime_type


async def migrate():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]

    print("Initializing object storage...")
    init_storage()
    print("OK\n")

    # 1. Migrate images from MongoDB (base64) to object storage
    print("=== Migrating images ===")
    migrated_images = 0
    cursor = db.uploads.find({"data": {"$exists": True}, "storage_path": {"$exists": False}})
    async for doc in cursor:
        image_id = doc["id"]
        ext = doc.get("filename", "image.jpg").rsplit(".", 1)[-1].lower() if "." in doc.get("filename", "") else "jpg"
        content_type = doc.get("content_type", get_mime_type(doc.get("filename", "image.jpg")))
        data = base64.b64decode(doc["data"])
        storage_path = f"wm-group/images/{image_id}.{ext}"

        try:
            result = put_object(storage_path, data, content_type)
            actual_path = result.get("path", storage_path)
            await db.uploads.update_one(
                {"_id": doc["_id"]},
                {"$set": {"storage_path": actual_path}, "$unset": {"data": ""}}
            )
            migrated_images += 1
            print(f"  Image {image_id} -> {actual_path} ({len(data)//1024}KB)")
        except Exception as e:
            print(f"  FAILED image {image_id}: {e}")

    print(f"Images migrated: {migrated_images}\n")

    # 2. Migrate videos from filesystem to object storage
    print("=== Migrating videos ===")
    video_dir = Path("/app/backend/uploads/videos")
    migrated_videos = 0
    video_files = sorted(video_dir.glob("*.mp4"))

    for filepath in video_files:
        video_id = filepath.stem
        # Skip temp files
        if "_compressed" in video_id or "_raw" in video_id:
            continue

        # Check if already migrated
        existing = await db.video_uploads.find_one({"id": video_id, "storage_path": {"$ne": None}})
        if existing:
            print(f"  Video {video_id} already migrated, skipping")
            continue

        data = filepath.read_bytes()
        storage_path = f"wm-group/videos/{video_id}.mp4"
        size = len(data)

        try:
            result = put_object(storage_path, data, "video/mp4")
            actual_path = result.get("path", storage_path)
            await db.video_uploads.update_one(
                {"id": video_id},
                {"$set": {
                    "id": video_id,
                    "storage_path": actual_path,
                    "content_type": "video/mp4",
                    "size": size,
                    "filename": filepath.name,
                }},
                upsert=True
            )
            migrated_videos += 1
            print(f"  Video {video_id} -> {actual_path} ({size//1024//1024}MB)")
        except Exception as e:
            print(f"  FAILED video {video_id}: {e}")

    print(f"Videos migrated: {migrated_videos}\n")
    print("Migration complete!")


if __name__ == "__main__":
    asyncio.run(migrate())
