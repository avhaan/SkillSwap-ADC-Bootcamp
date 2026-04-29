from fastapi import APIRouter, Depends

router = APIRouter(prefix="/api/likes", tags=["likes"])

@router.post("/{user_id}")
async def toggle_like(user_id: str):
    return {"message": f"Toggled like for user {user_id}"}

@router.get("/{user_id}/status")
async def like_status(user_id: str):
    return {"liked": False, "like_count": 0}