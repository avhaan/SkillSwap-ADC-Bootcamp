from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


CATEGORIES = [
    "Technology & Programming",
    "Design & Creative",
    "Music & Arts",
    "Language & Writing",
    "Cooking & Food",
    "Fitness & Sports",
    "Academic Tutoring",
    "Trades & DIY",
    "Business & Finance",
    "Photography & Video",
    "Other",
]

PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"]


# ── Skill sub-models ──────────────────────────────────────────────────────────

class SkillOffered(BaseModel):
    name: str = Field(..., min_length=1, max_length=60)
    category: str
    proficiency: str
    description: str = Field("", max_length=200)

    @field_validator("category")
    @classmethod
    def category_valid(cls, v):
        if v not in CATEGORIES:
            raise ValueError(f"Invalid category")
        return v

    @field_validator("proficiency")
    @classmethod
    def proficiency_valid(cls, v):
        if v not in PROFICIENCY_LEVELS:
            raise ValueError(f"Invalid proficiency")
        return v


class SkillWanted(BaseModel):
    name: str = Field(..., min_length=1, max_length=60)
    category: str

    @field_validator("category")
    @classmethod
    def category_valid(cls, v):
        if v not in CATEGORIES:
            raise ValueError(f"Invalid category")
        return v


class ContactInfo(BaseModel):
    show_email: bool = True
    phone: Optional[str] = None
    show_phone: bool = False


# ── Auth schemas ──────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    email: str = Field(..., min_length=3, max_length=120)
    password: str = Field(..., min_length=6, max_length=100)


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── User schemas ──────────────────────────────────────────────────────────────

class UserPublic(BaseModel):
    id: str
    name: str
    email: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    contact: ContactInfo
    skills_offered: List[SkillOffered] = []
    skills_wanted: List[SkillWanted] = []
    like_count: int = 0
    created_at: datetime


class UserCard(BaseModel):
    id: str
    name: str
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    skills_offered: List[SkillOffered] = []
    like_count: int = 0


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=80)
    bio: Optional[str] = Field(None, max_length=300)
    avatar_url: Optional[str] = None
    location: Optional[str] = Field(None, max_length=100)
    contact: Optional[ContactInfo] = None
    skills_offered: Optional[List[SkillOffered]] = None
    skills_wanted: Optional[List[SkillWanted]] = None

    @field_validator("skills_offered")
    @classmethod
    def max_eight_offered(cls, v):
        if v is not None and len(v) > 8:
            raise ValueError("Maximum 8 skills offered")
        return v

    @field_validator("skills_wanted")
    @classmethod
    def max_eight_wanted(cls, v):
        if v is not None and len(v) > 8:
            raise ValueError("Maximum 8 skills wanted")
        return v


class BrowseResponse(BaseModel):
    users: List[UserCard]
    total: int
    page: int
    limit: int
    total_pages: int


# ── Review schemas ────────────────────────────────────────────────────────────

class CreateReviewRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=1, max_length=500)


class ReviewPublic(BaseModel):
    id: str
    reviewer_id: str
    reviewer_name: str
    rating: int
    comment: str
    created_at: str
    updated_at: str


class ReviewsResponse(BaseModel):
    reviews: List[ReviewPublic]
    average_rating: Optional[float] = None
    total: int


# ── Like schemas ──────────────────────────────────────────────────────────────

class LikeStatusResponse(BaseModel):
    liked: bool
    like_count: int


# ── Helper ────────────────────────────────────────────────────────────────────

def doc_to_dict(doc: dict) -> dict:
    if doc is None:
        return None
    d = dict(doc)
    d["id"] = str(d.pop("_id"))
    return d