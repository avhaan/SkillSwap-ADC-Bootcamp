from fastapi import APIRouter

router = APIRouter(prefix="/api/auth", tags=["auth"])

async def get_current_user():
    return {
        "_id": "test_user_1",
        "name": "Test User"
    }

@router.post("/login")
async def login():
    return {"message": "Login endpoint placeholder"}