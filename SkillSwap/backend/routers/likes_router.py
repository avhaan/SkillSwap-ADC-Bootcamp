from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from ..auth import get_current_user_id
from ..database import likes_collection, users_collection
from ..models import LikeStatusResponse

router = APIRouter(prefix="/api/likes", tags=["likes"])

# Helper function to validate ID string
def _validate_user_id(user_id: str) -> ObjectId:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    return ObjectId(user_id)

# Helper function to look up user being "liked" in users_collection. If user doesn't exist, throws exception
async def _get_target_user(user_id: str) -> dict:
    target_user = await users_collection.find_one({"_id": _validate_user_id(user_id)})
    if target_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return target_user

# Updates the like count on user profile
async def _change_like_count(user_id: str, amount: int) -> int:
    updated_user = await users_collection.find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$inc": {"like_count": amount}},
        return_document=ReturnDocument.AFTER,
    )
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    like_count = updated_user.get("like_count", 0)
    if like_count < 0:
        await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"like_count": 0}},
        )
        return 0

    return like_count

# Blocks user from liking their own profile, then checks if like exists between user and person they are liking, 
# if so unlikes and decreases like count by -1, else create new like count and increase by 1. 
# Returns whether the person is liked or not and total like count. 
@router.post("/{user_id}", response_model=LikeStatusResponse)
async def toggle_like(user_id: str, current_user_id: str = Depends(get_current_user_id)):
    if user_id == current_user_id:
        raise HTTPException(status_code=400, detail="Cannot like yourself")

    target_user = await _get_target_user(user_id)
    existing_like = await likes_collection.find_one(
        {"liker_id": current_user_id, "target_user_id": user_id}
    )

    if existing_like:
        result = await likes_collection.delete_one({"_id": existing_like["_id"]})
        if result.deleted_count:
            like_count = await _change_like_count(user_id, -1)
        else:
            like_count = target_user.get("like_count", 0)
        return LikeStatusResponse(liked=False, like_count=max(0, like_count))

    try:
        await likes_collection.insert_one(
            {
                "liker_id": current_user_id,
                "target_user_id": user_id,
                "created_at": datetime.utcnow(),
            }
        )
    except DuplicateKeyError:
        like_count = target_user.get("like_count", 0)
    else:
        like_count = await _change_like_count(user_id, 1)

    return LikeStatusResponse(liked=True, like_count=max(0, like_count))

# For frontend to know if heart icon is filled or empty. Checks database to see if the user was liked or not and returns
# that along with the like count
@router.get("/{user_id}/status", response_model=LikeStatusResponse)
async def like_status(user_id: str, current_user_id: str = Depends(get_current_user_id)):
    target_user = await _get_target_user(user_id)
    existing_like = await likes_collection.find_one(
        {"liker_id": current_user_id, "target_user_id": user_id}
    )

    return LikeStatusResponse(
        liked=existing_like is not None,
        like_count=max(0, target_user.get("like_count", 0)),
    )
