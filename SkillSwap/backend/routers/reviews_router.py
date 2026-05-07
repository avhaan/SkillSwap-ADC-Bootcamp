from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from ..auth import get_current_user_id
from ..database import reviews_collection, users_collection
from ..models import CreateReviewRequest, ReviewPublic, ReviewsResponse, doc_to_dict

router = APIRouter(prefix="/api/reviews", tags=["reviews"])

# Helper function to validate ID string
def _validate_user_id(user_id: str) -> ObjectId:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    return ObjectId(user_id)

# Helper function to check ID of person currently logged in 
def _validate_current_user_id(user_id: str) -> ObjectId:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=401, detail="Invalid user token")
    return ObjectId(user_id)

# Takes data from MongoDB and returns in clean format
def _review_to_public(review: dict) -> ReviewPublic:
    review_dict = doc_to_dict(review)
    def format_dt(dt):
        # %B = Full Month (capitalized), %Y = Year, %M = Minute, %p = am/pm
        # Using a platform-independent way to strip leading zeros from Day (%d) and Hour (%I)
        
        # If on Windows, use %#d and %#I
        fmt = dt.strftime("%B %#d, %Y, %#I:%M %p")
        
        # This handles "pm" to "pm" while keeping "May" capitalized
        return fmt.replace("AM", "am").replace("PM", "pm")

    return ReviewPublic(
        id=review_dict["id"],
        reviewer_id=review_dict["reviewer_id"],
        reviewer_name=review_dict["reviewer_name"],
        rating=review_dict["rating"],
        comment=review_dict["comment"],
        created_at=format_dt(review_dict["created_at"]),
        updated_at=format_dt(review_dict["updated_at"]),
    )

# looks up all reviews for a user, calculates avg rating and total number of reviews, and returns a list of reviews sorted by newest first
@router.get("/{user_id}", response_model=ReviewsResponse)
async def get_reviews(user_id: str):
    _validate_user_id(user_id)

    cursor = reviews_collection.find({"target_user_id": user_id}).sort("created_at", -1)
    reviews = []
    total_rating = 0

    async for review in cursor:
        public_review = _review_to_public(review)
        reviews.append(public_review)
        total_rating += public_review.rating

    total = len(reviews)
    average_rating = round(total_rating / total, 1) if total else None

    return ReviewsResponse(
        reviews=reviews,
        average_rating=average_rating,
        total=total,
    )

# Blocks user from reviewing itself, verifies both user and person they are reviewing exists, saves review with timestamp, and prevents duplicate reviews
@router.post("/{user_id}", response_model=ReviewPublic, status_code=201)
async def create_review(
    user_id: str,
    body: CreateReviewRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    target_object_id = _validate_user_id(user_id)
    if user_id == current_user_id:
        raise HTTPException(status_code=400, detail="Cannot review yourself")

    target_user = await users_collection.find_one({"_id": target_object_id})
    if target_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    reviewer = await users_collection.find_one({"_id": _validate_current_user_id(current_user_id)})
    if reviewer is None:
        raise HTTPException(status_code=404, detail="Reviewer not found")

    now = datetime.utcnow()
    review = {
        "reviewer_id": current_user_id,
        "reviewer_name": reviewer["name"],
        "target_user_id": user_id,
        "rating": body.rating,
        "comment": body.comment.strip(),
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = await reviews_collection.insert_one(review)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="You have already reviewed this user")

    review["_id"] = result.inserted_id
    return _review_to_public(review)

# Finds a prev written review for a specific user, updates star rating, review comment, and timestamp 
@router.put("/{user_id}", response_model=ReviewPublic)
async def update_review(
    user_id: str,
    body: CreateReviewRequest,
    current_user_id: str = Depends(get_current_user_id),
):
    _validate_user_id(user_id)

    updated_review = await reviews_collection.find_one_and_update(
        {"reviewer_id": current_user_id, "target_user_id": user_id},
        {
            "$set": {
                "rating": body.rating,
                "comment": body.comment.strip(),
                "updated_at": datetime.utcnow(),
            }
        },
        return_document=ReturnDocument.AFTER,
    )
    if updated_review is None:
        raise HTTPException(status_code=404, detail="Review not found")

    return _review_to_public(updated_review)

# Finds the review written for a specific user and removes from database. If no review exists, throws error
@router.delete("/{user_id}", status_code=204)
async def delete_review(
    user_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    _validate_user_id(user_id)

    result = await reviews_collection.delete_one(
        {"reviewer_id": current_user_id, "target_user_id": user_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
