from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import re

router = APIRouter()

db = None
_verify_admin_func = None

def init(database, verify_admin_func):
    global db, _verify_admin_func
    db = database
    _verify_admin_func = verify_admin_func


class BlogArticle(BaseModel):
    slug: str = ""
    title: str = ""
    meta_description: str = ""
    category: str = "sauny"
    tags: List[str] = []
    cover_image: str = ""
    content: str = ""
    excerpt: str = ""
    author: str = "WM Group"
    published: bool = False
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


def slugify(text: str) -> str:
    text = text.lower().strip()
    replacements = {'ą':'a','ć':'c','ę':'e','ł':'l','ń':'n','ó':'o','ś':'s','ź':'z','ż':'z'}
    for k, v in replacements.items():
        text = text.replace(k, v)
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')


# Public endpoints
@router.get("/blog/articles")
async def get_articles(category: Optional[str] = None, published_only: bool = True):
    query = {}
    if published_only:
        query["published"] = True
    if category:
        query["category"] = category
    articles = []
    async for doc in db.blog_articles.find(query, {"_id": 0, "content": 0}).sort("created_at", -1):
        articles.append(doc)
    return articles


@router.get("/blog/articles/{slug}")
async def get_article(slug: str):
    article = await db.blog_articles.find_one({"slug": slug}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.get("/blog/categories")
async def get_categories():
    pipeline = [
        {"$match": {"published": True}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    cats = []
    async for doc in db.blog_articles.aggregate(pipeline):
        cats.append({"id": doc["_id"], "count": doc["count"]})
    return cats


# Admin endpoints
@router.get("/admin/blog/articles")
async def admin_get_articles(username: str = Depends(lambda: None)):
    username = _verify_admin_func
    articles = []
    async for doc in db.blog_articles.find({}, {"_id": 0}).sort("created_at", -1):
        articles.append(doc)
    return articles


@router.post("/admin/blog/articles")
async def create_article(article: BlogArticle, credentials: HTTPBasicCredentials = Depends(HTTPBasic())):
    if not article.slug:
        article.slug = slugify(article.title)
    existing = await db.blog_articles.find_one({"slug": article.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Article with this slug already exists")
    now = datetime.now(timezone.utc).isoformat()
    data = article.model_dump()
    data["created_at"] = now
    data["updated_at"] = now
    await db.blog_articles.insert_one(data)
    return {"status": "success", "slug": article.slug}


@router.put("/admin/blog/articles/{slug}")
async def update_article(slug: str, article: BlogArticle, credentials: HTTPBasicCredentials = Depends(HTTPBasic())):
    data = article.model_dump()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.blog_articles.update_one({"slug": slug}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"status": "success"}


@router.delete("/admin/blog/articles/{slug}")
async def delete_article(slug: str, credentials: HTTPBasicCredentials = Depends(HTTPBasic())):
    result = await db.blog_articles.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"status": "success"}
