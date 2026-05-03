from fastapi import APIRouter, Depends
from ..database import users_collection
from bson import ObjectId
from ..auth import *

router = APIRouter(prefix="/api/users", tags=["users"])


#responsible for getting users from mongo, adding them into the list, and returning it as json
@router.get("/")
async def get_users():
    users = []
    # this makes sure password isnt displayed (thank god)
    async for user in users_collection.find({}, {"password_hash": 0}):
        user["_id"] = str(user["_id"])
        users.append(user)

    return {"users": users}


@router.put("/me")
async def update_me(updated_data: dict, user_id: str = Depends(get_current_user_id)):
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
    user = await users_collection.find_one(
        {"_id": ObjectId(user_id)},
        {"password_hash": 0}
    )

    if user is None:
        return {"error": "User not found"}

    user["_id"] = str(user["_id"])
    return user
