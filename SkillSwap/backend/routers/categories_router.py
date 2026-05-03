from fastapi import APIRouter
# Import the lists you just made
from ..models import CATEGORIES, PROFICIENCY_LEVELS

router = APIRouter(prefix="/api/categories", tags=["categories"])

@router.get("/")
async def get_categories():
    return {
        "categories": CATEGORIES, 
        "proficiency_levels": PROFICIENCY_LEVELS
    }
