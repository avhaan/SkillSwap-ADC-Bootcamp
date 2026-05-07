from fastapi import APIRouter, Depends, Query
from ..database import users_collection
from bson import ObjectId
from ..auth import *
import math
import re

router = APIRouter(prefix="/api/users", tags=["users"])


#responsible for getting users from mongo, adding them into the list, and returning it as json
@router.get("/")
async def get_users(
    search: str = Query("", max_length=100),
    category: str = Query("", max_length=80),
    proficiency: str = Query("", max_length=40),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=48),
):
    query = {}

    if search:
        safe_search = re.escape(search.strip())
        query["$or"] = [
            {"name": {"$regex": safe_search, "$options": "i"}},
            {"location": {"$regex": safe_search, "$options": "i"}},
            {"skills_offered.name": {"$regex": safe_search, "$options": "i"}},
            {"skills_offered.description": {"$regex": safe_search, "$options": "i"}},
            {"skills_wanted.name": {"$regex": safe_search, "$options": "i"}},
        ]

    skill_filter = {}
    if category and category != "All categories":
        skill_filter["category"] = category
    if proficiency and proficiency != "All levels":
        skill_filter["proficiency"] = proficiency
    if skill_filter:
        query["skills_offered"] = {"$elemMatch": skill_filter}

    skip = (page - 1) * limit
    total = await users_collection.count_documents(query)
    users = []

    if search:
        query["$or"] = [
        {"skills_offered.name": {"$regex": search, "$options": "i"}},
        {"skills_offered.description": {"$regex": search, "$options": "i"}},]

    if proficiency:
        query["skills_offered.proficiency"] = proficiency

    if category:
        if (category!="All categories"):
            query["skills_offered.category"] = category



    # this makes sure password isnt displayed (thank god)
    cursor = (
        users_collection
        .find(query, {"password_hash": 0})
        .sort("like_count", -1)
        .skip(skip)
        .limit(limit)
    )

    async for user in cursor:
        user["_id"] = str(user["_id"])
        users.append(user)

    total_pages = max(1, math.ceil(total / limit))
    return {
        "users": users,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
    }


@router.put("/me")
async def update_me(updated_data: dict, user_id: str = Depends(get_current_user_id)):
    updated_data.pop("_id", None)
    updated_data.pop("password_hash", None)


    updated_user = await users_collection.find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$set": updated_data},
        return_document=True
    )

    if updated_user is None:
        return {"error": "User not found"}

    updated_user["_id"] = str(updated_user["_id"])

    updated_user.pop("password_hash", None)

    return updated_user

# this makes sure that the url is unique to the person currently using the website, and this finds 1 user and not all of them
@router.get("/{user_id}")
async def get_user(user_id: str):
    if not ObjectId.is_valid(user_id):
        return {"error": "User not found"}

    user = await users_collection.find_one(
        {"_id": ObjectId(user_id)},
        {"password_hash": 0}
    )

    if user is None:
        return {"error": "User not found"}

    user["_id"] = str(user["_id"])
    return user
