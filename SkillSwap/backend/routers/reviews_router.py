from fastapi import APIRouter, HTTPException, Depends
from ..database import db
from datetime import datetime
from ..auth import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["reviews"])

@router.get("/{user_id}")
async def get_reviews(user_id: str):
    reviews = await db.reviews.find({"target_user_id": user_id}).sort("created at", -1).to_list(None)
    return {"reviews": reviews}

@router.post("/{user_id}")
async def create_review(user_id: str):
    return {"message": f"Review created for user {user_id}"}