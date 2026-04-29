from fastapi import APIRouter, HTTPException, Depends

router = APIRouter(prefix="/api/reviews", tags=["reviews"])

@router.get("/{user_id}")
async def get_reviews(user_id: str):
    return {"message": f"Get reviews for user {user_id}"}

@router.post("/{user_id}")
async def create_review(user_id: str):
    return {"message": f"Review created for user {user_id}"}