from fastapi import APIRouter, Depends
from ..database import users_collection
from ..auth import *
from bson import ObjectId
router = APIRouter(prefix="/api/auth", tags=["auth"])

# checks if someone is already logged in
@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user_id)):
    user = await users_collection.find_one(
        {"_id": ObjectId(user_id)},
        {"password_hash": 0}
    )

    if user is None:
        return {"error": "User not found"}

    user["_id"] = str(user["_id"])
    return user

@router.post("/register")
async def register(user: dict):
    # checks if it already exists
    existing_user = await users_collection.find_one({"email": user["email"]})

    if existing_user:
        return {"error": "Email already registered"}


    new_user = {
    "name": user["name"],
    "email": user["email"],
    "password_hash": hash_password(user["password"]),
    "bio": "",
    "avatar_url": "",
    "location": "",
    "contact": {
        "show_email": True,
        "phone": "",
        "show_phone": False,
    },
    "skills_offered": [],
    "skills_wanted": [],
    "like_count": 0,
}
    
    result = await users_collection.insert_one(new_user)
    token = create_access_token(str(result.inserted_id))

    return {
    "access_token": token,
    "token_type": "bearer"
   }

@router.post("/login")
async def login(user: dict):
    existing_user = await users_collection.find_one({"email": user["email"]})

    if not existing_user:
        return {"error": "Invalid email or password"}

    password_is_correct = verify_password(
        user["password"],
        existing_user["password_hash"]
    )

    if not password_is_correct:
        return {"error": "Invalid email or password"}

    token = create_access_token(str(existing_user["_id"]))

    return {
    "access_token": token,
    "token_type": "bearer"
    }




