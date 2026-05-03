from fastapi import APIRouter

router = APIRouter(prefix="/api/categories", tags=["categories"])

@router.get("/")
async def get_categories():
    # Placeholder data until models.py is finished
    return {"categories": [], "proficiency_levels": []}