# SkillSwap — Full Implementation Guide
> Hackathon Spring 2026 | Stack: React + FastAPI + MongoDB | 5 people | Deadline May 7

---

## TEAM ASSIGNMENTS AT A GLANCE

| Person | Role | Pages / Files Owned |
|--------|------|---------------------|
| **B1** | Backend 1 | Project setup, DB connection, auth endpoints, user CRUD, seed script |
| **B2** | Backend 2 | Reviews endpoints, likes endpoints, search/filter logic, categories endpoint |
| **F1** | Frontend 1 | Landing page (`/`), Browse page (`/browse`), Navbar, SkillCard, SearchBar, FilterPanel, Pagination |
| **F2** | Frontend 2 | Profile detail page (`/profile/:id`), ProfileHeader, SkillList, ReviewCard, ReviewForm, LikeButton |
| **F3** | Frontend 3 | Register page (`/register`), Login page (`/login`), Edit Profile page (`/profile/me/edit`), AuthContext, all API utility functions |

**Rule:** B1 and B2 work in parallel from day one — their endpoints do not depend on each other. F3 builds AuthContext and the API layer first so F1 and F2 can plug in real data. F1 and F2 start with hardcoded mock data and swap in real API calls once F3 finishes the fetch utilities.

---

## PART 0 — REPOSITORY STRUCTURE

Everyone clones the same repo. B1 sets this up on day one.

```
skillswap/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── auth.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth_router.py       ← B1
│   │   ├── users_router.py      ← B1
│   │   ├── reviews_router.py    ← B2
│   │   ├── likes_router.py      ← B2
│   │   └── categories_router.py ← B2
│   ├── seed.py                  ← B1
│   ├── requirements.txt
│   └── .env                     ← never commit this
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.js
│   │   ├── App.js
│   │   ├── index.css
│   │   ├── context/
│   │   │   └── AuthContext.js   ← F3
│   │   ├── api/
│   │   │   └── api.js           ← F3
│   │   ├── components/
│   │   │   ├── Navbar.js        ← F1
│   │   │   ├── SkillCard.js     ← F1
│   │   │   ├── SkillBadge.js    ← F1
│   │   │   ├── SearchBar.js     ← F1
│   │   │   ├── FilterPanel.js   ← F1
│   │   │   ├── Pagination.js    ← F1
│   │   │   ├── ProfileHeader.js ← F2
│   │   │   ├── SkillList.js     ← F2
│   │   │   ├── ReviewCard.js    ← F2
│   │   │   ├── ReviewForm.js    ← F2
│   │   │   └── LikeButton.js    ← F2
│   │   └── pages/
│   │       ├── LandingPage.js   ← F1
│   │       ├── BrowsePage.js    ← F1
│   │       ├── ProfilePage.js   ← F2
│   │       ├── EditProfilePage.js ← F3
│   │       ├── RegisterPage.js  ← F3
│   │       └── LoginPage.js     ← F3
│   └── package.json
└── README.md
```

---

## PART 1 — BACKEND PERSON 1 (B1)

### Your responsibilities
- `requirements.txt`
- `database.py` — MongoDB connection
- `models.py` — Pydantic schemas shared across the whole backend (B2 imports from this)
- `auth.py` — JWT helpers
- `main.py` — FastAPI app, CORS, router registration
- `routers/auth_router.py` — register, login, /me
- `routers/users_router.py` — GET /users, GET /users/:id, PUT /me, DELETE /me
- `seed.py` — seed script with 10 fake users

---

### `backend/requirements.txt`

```
fastapi==0.111.0
uvicorn==0.29.0
motor==3.4.0
pydantic==2.7.1
pydantic-settings==2.2.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
python-dotenv==1.0.1
```

Install with: `pip install -r requirements.txt`

---

### `backend/.env`

```
MONGO_URL=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=skillswap
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

Replace `MONGO_URL` with your Atlas connection string. Add `.env` to `.gitignore` — never commit it.

---

### `backend/database.py`

```python
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "skillswap")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

users_collection = db["users"]
reviews_collection = db["reviews"]
likes_collection = db["likes"]


async def create_indexes():
    await users_collection.create_index("email", unique=True)
    await users_collection.create_index([
        ("name", "text"),
        ("skills_offered.name", "text"),
        ("skills_offered.description", "text"),
    ])
    await reviews_collection.create_index(
        [("reviewer_id", 1), ("target_user_id", 1)],
        unique=True
    )
    await reviews_collection.create_index("target_user_id")
    await likes_collection.create_index(
        [("liker_id", 1), ("target_user_id", 1)],
        unique=True
    )
```

---

### `backend/models.py`

B2 imports `CATEGORIES`, `PROFICIENCY_LEVELS`, `doc_to_dict`, and the review/like schemas from here.
Write and push this before B2 starts working.

```python
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
    created_at: datetime
    updated_at: datetime


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
```

---

### `backend/auth.py`

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "changeme")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": user_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    user_id = decode_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return user_id


async def get_optional_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
) -> Optional[str]:
    if credentials is None:
        return None
    return decode_token(credentials.credentials)
```

---

### `backend/routers/auth_router.py`

```python
from fastapi import APIRouter, HTTPException, Depends
from database import users_collection
from models import RegisterRequest, LoginRequest, TokenResponse, UserPublic, doc_to_dict
from auth import hash_password, verify_password, create_access_token, get_current_user_id
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest):
    existing = await users_collection.find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    now = datetime.utcnow()
    doc = {
        "name": body.name.strip(),
        "email": body.email.lower().strip(),
        "password_hash": hash_password(body.password),
        "bio": None,
        "avatar_url": None,
        "location": None,
        "contact": {"show_email": True, "phone": None, "show_phone": False},
        "skills_offered": [],
        "skills_wanted": [],
        "like_count": 0,
        "created_at": now,
        "updated_at": now,
    }
    result = await users_collection.insert_one(doc)
    token = create_access_token(str(result.inserted_id))
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    user = await users_collection.find_one({"email": body.email.lower().strip()})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user["_id"]))
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserPublic)
async def get_me(user_id: str = Depends(get_current_user_id)):
    user = await users_collection.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return doc_to_dict(user)
```

---

### `backend/routers/users_router.py`

```python
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional
from bson import ObjectId
from datetime import datetime
from database import users_collection, reviews_collection, likes_collection
from models import UserPublic, UserCard, UpdateProfileRequest, BrowseResponse, doc_to_dict
from auth import get_current_user_id

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/", response_model=BrowseResponse)
async def browse_users(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    proficiency: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=48),
):
    query = {}

    if search and search.strip():
        query["$text"] = {"$search": search.strip()}

    elem_match = {}
    if category and category.strip():
        elem_match["category"] = category.strip()
    if proficiency and proficiency.strip():
        elem_match["proficiency"] = proficiency.strip()
    if elem_match:
        query["skills_offered"] = {"$elemMatch": elem_match}

    skip = (page - 1) * limit
    total = await users_collection.count_documents(query)

    cursor = users_collection.find(query, {"password_hash": 0}).skip(skip).limit(limit).sort("like_count", -1)

    users = []
    async for doc in cursor:
        d = doc_to_dict(doc)
        users.append(UserCard(
            id=d["id"],
            name=d["name"],
            avatar_url=d.get("avatar_url"),
            location=d.get("location"),
            skills_offered=d.get("skills_offered", []),
            like_count=d.get("like_count", 0),
        ))

    total_pages = max(1, (total + limit - 1) // limit)
    return BrowseResponse(users=users, total=total, page=page, limit=limit, total_pages=total_pages)


@router.get("/{user_id}", response_model=UserPublic)
async def get_user(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    user = await users_collection.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return doc_to_dict(user)


@router.put("/me", response_model=UserPublic)
async def update_profile(body: UpdateProfileRequest, user_id: str = Depends(get_current_user_id)):
    update_data = body.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="Nothing to update")

    if "skills_offered" in update_data:
        update_data["skills_offered"] = [
            s.model_dump() if hasattr(s, "model_dump") else s
            for s in update_data["skills_offered"]
        ]
    if "skills_wanted" in update_data:
        update_data["skills_wanted"] = [
            s.model_dump() if hasattr(s, "model_dump") else s
            for s in update_data["skills_wanted"]
        ]
    if "contact" in update_data and hasattr(update_data["contact"], "model_dump"):
        update_data["contact"] = update_data["contact"].model_dump()

    update_data["updated_at"] = datetime.utcnow()

    result = await users_collection.find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$set": update_data},
        return_document=True,
        projection={"password_hash": 0},
    )
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return doc_to_dict(result)


@router.delete("/me", status_code=204)
async def delete_account(user_id: str = Depends(get_current_user_id)):
    oid = ObjectId(user_id)
    await users_collection.delete_one({"_id": oid})
    await reviews_collection.delete_many({"reviewer_id": user_id})
    await reviews_collection.delete_many({"target_user_id": user_id})
    await likes_collection.delete_many({"liker_id": user_id})
    await likes_collection.delete_many({"target_user_id": user_id})
```

---

### `backend/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import create_indexes
from routers import auth_router, users_router, reviews_router, likes_router, categories_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_indexes()
    yield


app = FastAPI(title="SkillSwap API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(reviews_router.router)
app.include_router(likes_router.router)
app.include_router(categories_router.router)


@app.get("/")
async def root():
    return {"message": "SkillSwap API is running"}
```

Run: `uvicorn main:app --reload --port 8000`
Swagger docs auto-generated at: `http://localhost:8000/docs`

---

### `backend/routers/__init__.py`

```python
from routers import auth_router, users_router, reviews_router, likes_router, categories_router
```

---

### `backend/seed.py`

Run once before the demo: `python seed.py`

```python
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
db = client[os.getenv("DB_NAME", "skillswap")]
users_col = db["users"]
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

SEED_USERS = [
    {
        "name": "Alex Rivera", "email": "alex@example.com", "location": "College Park, MD",
        "bio": "CS junior who loves teaching Python and learning music.",
        "skills_offered": [
            {"name": "Python", "category": "Technology & Programming", "proficiency": "Advanced", "description": "Taught 3 workshops on Flask and data analysis."},
            {"name": "Git & GitHub", "category": "Technology & Programming", "proficiency": "Intermediate", "description": "Version control, branching, PRs."},
        ],
        "skills_wanted": [{"name": "Guitar", "category": "Music & Arts"}],
    },
    {
        "name": "Jamie Chen", "email": "jamie@example.com", "location": "Washington, DC",
        "bio": "Graphic designer and weekend chef.",
        "skills_offered": [
            {"name": "Figma", "category": "Design & Creative", "proficiency": "Expert", "description": "UI/UX design, prototyping, component libraries."},
            {"name": "Thai Cooking", "category": "Cooking & Food", "proficiency": "Intermediate", "description": "Authentic recipes from scratch."},
        ],
        "skills_wanted": [{"name": "Spanish", "category": "Language & Writing"}, {"name": "Photography", "category": "Photography & Video"}],
    },
    {
        "name": "Morgan Lee", "email": "morgan@example.com", "location": "Silver Spring, MD",
        "bio": "Musician and language tutor.",
        "skills_offered": [
            {"name": "Guitar", "category": "Music & Arts", "proficiency": "Advanced", "description": "Classical and fingerstyle, 8 years experience."},
            {"name": "Spanish", "category": "Language & Writing", "proficiency": "Expert", "description": "Native speaker, conversational and academic tutoring."},
        ],
        "skills_wanted": [{"name": "Python", "category": "Technology & Programming"}, {"name": "Yoga", "category": "Fitness & Sports"}],
    },
    {
        "name": "Sam Patel", "email": "sam@example.com", "location": "Hyattsville, MD",
        "bio": "Finance undergrad who can also fix anything.",
        "skills_offered": [
            {"name": "Excel & Financial Modeling", "category": "Business & Finance", "proficiency": "Advanced", "description": "DCF models, pivot tables, VBA macros."},
            {"name": "Basic Plumbing", "category": "Trades & DIY", "proficiency": "Beginner", "description": "Faucets, simple pipe repairs."},
        ],
        "skills_wanted": [{"name": "Figma", "category": "Design & Creative"}],
    },
    {
        "name": "Taylor Brooks", "email": "taylor@example.com", "location": "College Park, MD",
        "bio": "Personal trainer and math tutor.",
        "skills_offered": [
            {"name": "Strength Training", "category": "Fitness & Sports", "proficiency": "Expert", "description": "Program design, form coaching, nutrition basics."},
            {"name": "Calculus Tutoring", "category": "Academic Tutoring", "proficiency": "Advanced", "description": "Calc I, II, III. Helped 20+ students pass."},
        ],
        "skills_wanted": [{"name": "Photography", "category": "Photography & Video"}],
    },
    {
        "name": "Jordan Kim", "email": "jordan@example.com", "location": "Bethesda, MD",
        "bio": "Photographer who wants to learn to code.",
        "skills_offered": [
            {"name": "Portrait Photography", "category": "Photography & Video", "proficiency": "Advanced", "description": "Headshots, events, Lightroom editing."},
            {"name": "Video Editing", "category": "Photography & Video", "proficiency": "Intermediate", "description": "Premiere Pro, short-form content."},
        ],
        "skills_wanted": [{"name": "JavaScript", "category": "Technology & Programming"}],
    },
    {
        "name": "Casey Wu", "email": "casey@example.com", "location": "Greenbelt, MD",
        "bio": "Japanese food enthusiast and React developer.",
        "skills_offered": [
            {"name": "React", "category": "Technology & Programming", "proficiency": "Intermediate", "description": "Hooks, context, routing."},
            {"name": "Japanese Cooking", "category": "Cooking & Food", "proficiency": "Advanced", "description": "Ramen from scratch, sushi, bento boxes."},
        ],
        "skills_wanted": [{"name": "Japanese Language", "category": "Language & Writing"}],
    },
    {
        "name": "Riley Nguyen", "email": "riley@example.com", "location": "College Park, MD",
        "bio": "Yoga teacher and aspiring data scientist.",
        "skills_offered": [
            {"name": "Yoga", "category": "Fitness & Sports", "proficiency": "Expert", "description": "200hr RYT certified. Hatha, vinyasa, restorative."},
        ],
        "skills_wanted": [{"name": "Data Analysis", "category": "Technology & Programming"}],
    },
    {
        "name": "Drew Martinez", "email": "drew@example.com", "location": "Takoma Park, MD",
        "bio": "Carpenter and woodworker.",
        "skills_offered": [
            {"name": "Woodworking", "category": "Trades & DIY", "proficiency": "Expert", "description": "Furniture building, joinery, finishing."},
            {"name": "Home Repair", "category": "Trades & DIY", "proficiency": "Advanced", "description": "Drywall, tiling, painting."},
        ],
        "skills_wanted": [{"name": "Accounting", "category": "Business & Finance"}],
    },
    {
        "name": "Avery Thompson", "email": "avery@example.com", "location": "Rockville, MD",
        "bio": "French tutor and amateur filmmaker.",
        "skills_offered": [
            {"name": "French", "category": "Language & Writing", "proficiency": "Expert", "description": "Accent coaching, grammar, conversational practice."},
        ],
        "skills_wanted": [{"name": "Woodworking", "category": "Trades & DIY"}, {"name": "Piano", "category": "Music & Arts"}],
    },
]


async def seed():
    await users_col.delete_many({})
    print("Cleared existing users.")
    now = datetime.utcnow()
    for i, u in enumerate(SEED_USERS):
        doc = {
            "name": u["name"], "email": u["email"],
            "password_hash": pwd.hash("password123"),
            "bio": u.get("bio"), "avatar_url": None,
            "location": u.get("location"),
            "contact": {"show_email": True, "phone": None, "show_phone": False},
            "skills_offered": u.get("skills_offered", []),
            "skills_wanted": u.get("skills_wanted", []),
            "like_count": i * 3,
            "created_at": now, "updated_at": now,
        }
        await users_col.insert_one(doc)
        print(f"  Inserted: {u['name']}")
    print(f"\nDone. {len(SEED_USERS)} users seeded. Password for all: password123")


if __name__ == "__main__":
    asyncio.run(seed())
```

---

## PART 2 — BACKEND PERSON 2 (B2)

### Your responsibilities
- `routers/categories_router.py`
- `routers/reviews_router.py`
- `routers/likes_router.py`

You only need `models.py` and `database.py` from B1 (pushed on day 1). Your three routers are completely independent of B1's routers. You can work in parallel immediately.

---

### `backend/routers/categories_router.py`

```python
from fastapi import APIRouter
from models import CATEGORIES, PROFICIENCY_LEVELS

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("/")
async def get_categories():
    return {"categories": CATEGORIES, "proficiency_levels": PROFICIENCY_LEVELS}
```

---

### `backend/routers/reviews_router.py`

```python
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from pymongo.errors import DuplicateKeyError
from database import reviews_collection, users_collection
from models import CreateReviewRequest, ReviewPublic, ReviewsResponse, doc_to_dict
from auth import get_current_user_id

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


def _to_public(doc: dict) -> ReviewPublic:
    d = doc_to_dict(doc)
    return ReviewPublic(**{k: d[k] for k in ["id","reviewer_id","reviewer_name","rating","comment","created_at","updated_at"]})


@router.get("/{user_id}", response_model=ReviewsResponse)
async def get_reviews(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    cursor = reviews_collection.find({"target_user_id": user_id}).sort("created_at", -1)
    reviews = []
    total_rating = 0
    async for doc in cursor:
        r = _to_public(doc)
        reviews.append(r)
        total_rating += r.rating
    total = len(reviews)
    avg = round(total_rating / total, 1) if total > 0 else None
    return ReviewsResponse(reviews=reviews, average_rating=avg, total=total)


@router.post("/{user_id}", response_model=ReviewPublic, status_code=201)
async def create_review(user_id: str, body: CreateReviewRequest, current_user_id: str = Depends(get_current_user_id)):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    if user_id == current_user_id:
        raise HTTPException(status_code=400, detail="Cannot review yourself")

    target = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    reviewer = await users_collection.find_one({"_id": ObjectId(current_user_id)})
    reviewer_name = reviewer["name"] if reviewer else "Unknown"

    now = datetime.utcnow()
    doc = {
        "reviewer_id": current_user_id,
        "reviewer_name": reviewer_name,
        "target_user_id": user_id,
        "rating": body.rating,
        "comment": body.comment.strip(),
        "created_at": now, "updated_at": now,
    }
    try:
        result = await reviews_collection.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="You have already reviewed this user")

    doc["_id"] = result.inserted_id
    return _to_public(doc)


@router.put("/{user_id}", response_model=ReviewPublic)
async def update_review(user_id: str, body: CreateReviewRequest, current_user_id: str = Depends(get_current_user_id)):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    result = await reviews_collection.find_one_and_update(
        {"reviewer_id": current_user_id, "target_user_id": user_id},
        {"$set": {"rating": body.rating, "comment": body.comment.strip(), "updated_at": datetime.utcnow()}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Review not found")
    return _to_public(result)


@router.delete("/{user_id}", status_code=204)
async def delete_review(user_id: str, current_user_id: str = Depends(get_current_user_id)):
    result = await reviews_collection.delete_one(
        {"reviewer_id": current_user_id, "target_user_id": user_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
```

---

### `backend/routers/likes_router.py`

```python
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from pymongo.errors import DuplicateKeyError
from database import likes_collection, users_collection
from models import LikeStatusResponse
from auth import get_current_user_id

router = APIRouter(prefix="/api/likes", tags=["likes"])


@router.post("/{user_id}", response_model=LikeStatusResponse)
async def toggle_like(user_id: str, current_user_id: str = Depends(get_current_user_id)):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    if user_id == current_user_id:
        raise HTTPException(status_code=400, detail="Cannot like yourself")

    target = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    existing = await likes_collection.find_one({"liker_id": current_user_id, "target_user_id": user_id})

    if existing:
        await likes_collection.delete_one({"_id": existing["_id"]})
        updated = await users_collection.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$inc": {"like_count": -1}},
            return_document=True,
        )
        liked = False
    else:
        try:
            await likes_collection.insert_one({
                "liker_id": current_user_id,
                "target_user_id": user_id,
                "created_at": datetime.utcnow(),
            })
        except DuplicateKeyError:
            pass
        updated = await users_collection.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$inc": {"like_count": 1}},
            return_document=True,
        )
        liked = True

    return LikeStatusResponse(liked=liked, like_count=max(0, updated.get("like_count", 0)))


@router.get("/{user_id}/status", response_model=LikeStatusResponse)
async def like_status(user_id: str, current_user_id: str = Depends(get_current_user_id)):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    target = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    existing = await likes_collection.find_one({"liker_id": current_user_id, "target_user_id": user_id})
    return LikeStatusResponse(liked=existing is not None, like_count=target.get("like_count", 0))
```

---

## PART 3 — FRONTEND SETUP (all three F persons — day one)

```bash
cd skillswap
npx create-react-app frontend
cd frontend
npm install react-router-dom
```

---

### `frontend/public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SkillSwap</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

---

### `frontend/src/index.js`

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
```

---

### `frontend/src/App.js`

```javascript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import BrowsePage from './pages/BrowsePage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/profile/me/edit" element={
            <ProtectedRoute><EditProfilePage /></ProtectedRoute>
          } />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

### `frontend/src/index.css`

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --primary: #5b4fcf;
  --primary-light: #ede9ff;
  --primary-dark: #3d33a3;
  --accent: #f97316;
  --bg: #f8f7ff;
  --surface: #ffffff;
  --border: #e2e0f0;
  --text: #1a1523;
  --text-muted: #6b6880;
  --radius: 12px;
  --radius-sm: 6px;
  --shadow: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
  --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

body { font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.6; }
a { color: inherit; text-decoration: none; }

.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.page { padding: 32px 0 64px; }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 6px; padding: 10px 20px; border-radius: var(--radius-sm);
  font-size: 14px; font-weight: 500; cursor: pointer; border: none;
  transition: all 0.15s;
}
.btn-primary { background: var(--primary); color: #fff; }
.btn-primary:hover { background: var(--primary-dark); }
.btn-outline { background: transparent; color: var(--primary); border: 1.5px solid var(--primary); }
.btn-outline:hover { background: var(--primary-light); }
.btn-ghost { background: transparent; color: var(--text-muted); border: 1.5px solid var(--border); }
.btn-ghost:hover { border-color: var(--primary); color: var(--primary); }
.btn-danger { background: #ef4444; color: #fff; border: none; }
.btn-danger:hover { background: #dc2626; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
label { font-size: 13px; font-weight: 500; color: var(--text-muted); }
input, select, textarea {
  padding: 10px 14px; border: 1.5px solid var(--border);
  border-radius: var(--radius-sm); font-size: 14px; font-family: var(--font);
  background: var(--surface); color: var(--text); transition: border-color 0.15s;
}
input:focus, select:focus, textarea:focus { outline: none; border-color: var(--primary); }
textarea { resize: vertical; min-height: 80px; }
.error-text { color: #ef4444; font-size: 13px; }

.card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow);
}

.badge { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; }
.badge-beginner     { background: #f0fdf4; color: #166534; }
.badge-intermediate { background: #eff6ff; color: #1d4ed8; }
.badge-advanced     { background: #fdf4ff; color: #7e22ce; }
.badge-expert       { background: #fff7ed; color: #c2410c; }
```

---

## PART 4 — FRONTEND PERSON 3 (F3)

Build these first — F1 and F2 depend on `AuthContext` and `api.js`.

---

### `frontend/src/context/AuthContext.js`

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:8000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => { setUser(data); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  function login(newToken, userData) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  function refreshUser(updatedUser) {
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

---

### `frontend/src/api/api.js`

```javascript
const BASE = 'http://localhost:8000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || 'Request failed');
  }
  if (res.status === 204) return null;
  return res.json();
}

// Auth
export async function apiRegister(name, email, password) {
  return handleResponse(await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  }));
}

export async function apiLogin(email, password) {
  return handleResponse(await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }));
}

export async function apiGetMe() {
  return handleResponse(await fetch(`${BASE}/api/auth/me`, {
    headers: authHeaders(),
  }));
}

// Users
export async function apiBrowseUsers({ search = '', category = '', proficiency = '', page = 1, limit = 12 } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  if (proficiency) params.append('proficiency', proficiency);
  params.append('page', page);
  params.append('limit', limit);
  return handleResponse(await fetch(`${BASE}/api/users/?${params}`));
}

export async function apiGetUser(userId) {
  return handleResponse(await fetch(`${BASE}/api/users/${userId}`));
}

export async function apiUpdateProfile(data) {
  return handleResponse(await fetch(`${BASE}/api/users/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  }));
}

export async function apiDeleteAccount() {
  return handleResponse(await fetch(`${BASE}/api/users/me`, {
    method: 'DELETE',
    headers: authHeaders(),
  }));
}

// Reviews
export async function apiGetReviews(userId) {
  return handleResponse(await fetch(`${BASE}/api/reviews/${userId}`));
}

export async function apiCreateReview(userId, rating, comment) {
  return handleResponse(await fetch(`${BASE}/api/reviews/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ rating, comment }),
  }));
}

export async function apiUpdateReview(userId, rating, comment) {
  return handleResponse(await fetch(`${BASE}/api/reviews/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ rating, comment }),
  }));
}

export async function apiDeleteReview(userId) {
  return handleResponse(await fetch(`${BASE}/api/reviews/${userId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }));
}

// Likes
export async function apiToggleLike(userId) {
  return handleResponse(await fetch(`${BASE}/api/likes/${userId}`, {
    method: 'POST',
    headers: authHeaders(),
  }));
}

export async function apiGetLikeStatus(userId) {
  return handleResponse(await fetch(`${BASE}/api/likes/${userId}/status`, {
    headers: authHeaders(),
  }));
}

// Categories
export async function apiGetCategories() {
  return handleResponse(await fetch(`${BASE}/api/categories/`));
}
```

---

### `frontend/src/pages/RegisterPage.js`

```javascript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRegister } from '../api/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('All fields are required.'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    setLoading(true);
    try {
      const { access_token } = await apiRegister(form.name, form.email, form.password);
      const me = await fetch('http://localhost:8000/api/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      }).then(r => r.json());
      login(access_token, me);
      navigate('/profile/me/edit');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container page" style={{ maxWidth: 480 }}>
      <h1 style={{ marginBottom: 8 }}>Create your account</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
        Join SkillSwap and start trading skills.
      </p>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input name="name" type="text" placeholder="Your name" value={form.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
          </div>
          {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
```

---

### `frontend/src/pages/LoginPage.js`

```javascript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiLogin } from '../api/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { access_token } = await apiLogin(form.email, form.password);
      const me = await fetch('http://localhost:8000/api/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      }).then(r => r.json());
      login(access_token, me);
      navigate('/browse');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container page" style={{ maxWidth: 480 }}>
      <h1 style={{ marginBottom: 8 }}>Welcome back</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Log in to browse and trade skills.</p>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Your password" value={form.password} onChange={handleChange} />
          </div>
          {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
          No account? <Link to="/register" style={{ color: 'var(--primary)' }}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
```

---

### `frontend/src/pages/EditProfilePage.js`

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiUpdateProfile, apiGetCategories } from '../api/api';

const PROFICIENCY = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '', bio: '', avatar_url: '', location: '',
    contact: { show_email: true, phone: '', show_phone: false },
    skills_offered: [], skills_wanted: [],
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGetCategories().then(d => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        location: user.location || '',
        contact: {
          show_email: user.contact?.show_email ?? true,
          phone: user.contact?.phone || '',
          show_phone: user.contact?.show_phone ?? false,
        },
        skills_offered: user.skills_offered || [],
        skills_wanted: user.skills_wanted || [],
      });
    }
  }, [user]);

  const setField = (name, value) => setForm(f => ({ ...f, [name]: value }));
  const setContact = (name, value) => setForm(f => ({ ...f, contact: { ...f.contact, [name]: value } }));

  function addOffered() {
    if (form.skills_offered.length >= 8) return;
    setForm(f => ({ ...f, skills_offered: [...f.skills_offered, { name: '', category: '', proficiency: 'Beginner', description: '' }] }));
  }
  function updateOffered(idx, field, value) {
    setForm(f => {
      const s = [...f.skills_offered];
      s[idx] = { ...s[idx], [field]: value };
      return { ...f, skills_offered: s };
    });
  }
  function removeOffered(idx) {
    setForm(f => ({ ...f, skills_offered: f.skills_offered.filter((_, i) => i !== idx) }));
  }

  function addWanted() {
    if (form.skills_wanted.length >= 8) return;
    setForm(f => ({ ...f, skills_wanted: [...f.skills_wanted, { name: '', category: '' }] }));
  }
  function updateWanted(idx, field, value) {
    setForm(f => {
      const s = [...f.skills_wanted];
      s[idx] = { ...s[idx], [field]: value };
      return { ...f, skills_wanted: s };
    });
  }
  function removeWanted(idx) {
    setForm(f => ({ ...f, skills_wanted: f.skills_wanted.filter((_, i) => i !== idx) }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    for (const s of form.skills_offered) {
      if (!s.name.trim() || !s.category) { setError('Each offered skill needs a name and category.'); return; }
    }
    for (const s of form.skills_wanted) {
      if (!s.name.trim() || !s.category) { setError('Each wanted skill needs a name and category.'); return; }
    }
    setSaving(true);
    try {
      const updated = await apiUpdateProfile({
        name: form.name,
        bio: form.bio || null,
        avatar_url: form.avatar_url || null,
        location: form.location || null,
        contact: { show_email: form.contact.show_email, phone: form.contact.phone || null, show_phone: form.contact.show_phone },
        skills_offered: form.skills_offered,
        skills_wanted: form.skills_wanted,
      });
      refreshUser(updated);
      navigate(`/profile/${updated.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container page" style={{ maxWidth: 680 }}>
      <h1 style={{ marginBottom: 32 }}>Edit your profile</h1>
      <form onSubmit={handleSave}>

        {/* Basic info */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16 }}>Basic info</h2>
          <div className="form-group">
            <label>Display name *</label>
            <input value={form.name} onChange={e => setField('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea value={form.bio} onChange={e => setField('bio', e.target.value)} placeholder="Tell people about yourself…" />
          </div>
          <div className="form-group">
            <label>Avatar URL</label>
            <input value={form.avatar_url} onChange={e => setField('avatar_url', e.target.value)} placeholder="https://… paste an image URL" />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input value={form.location} onChange={e => setField('location', e.target.value)} placeholder="e.g. College Park, MD" />
          </div>
        </div>

        {/* Contact */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16 }}>Contact</h2>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="show_email" checked={form.contact.show_email} onChange={e => setContact('show_email', e.target.checked)} />
            <label htmlFor="show_email" style={{ margin: 0 }}>Show my email on profile ({user?.email})</label>
          </div>
          <div className="form-group">
            <label>Phone (optional)</label>
            <input value={form.contact.phone} onChange={e => setContact('phone', e.target.value)} placeholder="+1 555 000 0000" />
          </div>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="show_phone" checked={form.contact.show_phone} onChange={e => setContact('show_phone', e.target.checked)} />
            <label htmlFor="show_phone" style={{ margin: 0 }}>Show my phone on profile</label>
          </div>
        </div>

        {/* Skills offered */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16 }}>Skills I can offer ({form.skills_offered.length}/8)</h2>
            <button type="button" className="btn btn-outline" onClick={addOffered} disabled={form.skills_offered.length >= 8}>+ Add</button>
          </div>
          {form.skills_offered.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No skills yet. Click + Add.</p>}
          {form.skills_offered.map((s, i) => (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Skill name *</label>
                  <input value={s.name} onChange={e => updateOffered(i, 'name', e.target.value)} placeholder="e.g. Python" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Category *</label>
                  <select value={s.category} onChange={e => updateOffered(i, 'category', e.target.value)}>
                    <option value="">Select…</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Proficiency</label>
                  <select value={s.proficiency} onChange={e => updateOffered(i, 'proficiency', e.target.value)}>
                    {PROFICIENCY.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Description</label>
                  <input value={s.description} onChange={e => updateOffered(i, 'description', e.target.value)} placeholder="Brief description…" maxLength={200} />
                </div>
              </div>
              <button type="button" className="btn btn-danger" style={{ marginTop: 10, fontSize: 12, padding: '6px 12px' }} onClick={() => removeOffered(i)}>Remove</button>
            </div>
          ))}
        </div>

        {/* Skills wanted */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16 }}>Skills I want to learn ({form.skills_wanted.length}/8)</h2>
            <button type="button" className="btn btn-outline" onClick={addWanted} disabled={form.skills_wanted.length >= 8}>+ Add</button>
          </div>
          {form.skills_wanted.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No skills yet.</p>}
          {form.skills_wanted.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, marginBottom: 10, alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Skill name *</label>
                <input value={s.name} onChange={e => updateWanted(i, 'name', e.target.value)} placeholder="e.g. Guitar" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Category *</label>
                <select value={s.category} onChange={e => updateWanted(i, 'category', e.target.value)}>
                  <option value="">Select…</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button type="button" className="btn btn-danger" style={{ padding: '10px 14px' }} onClick={() => removeWanted(i)}>✕</button>
            </div>
          ))}
        </div>

        {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
```

---

## PART 5 — FRONTEND PERSON 1 (F1)

---

### `frontend/src/components/Navbar.js`

```javascript
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 60, gap: 16 }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)', flexShrink: 0 }}>SkillSwap</Link>
        <div style={{ flex: 1 }} />
        <Link to="/browse" className="btn btn-ghost" style={{ padding: '8px 16px' }}>Browse</Link>
        {user ? (
          <>
            <Link to={`/profile/${user.id}`} style={{ fontSize: 14, color: 'var(--text-muted)' }}>{user.name}</Link>
            <Link to="/profile/me/edit" className="btn btn-outline" style={{ padding: '8px 16px' }}>Edit profile</Link>
            <button className="btn btn-ghost" onClick={() => { logout(); navigate('/'); }} style={{ padding: '8px 16px' }}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost" style={{ padding: '8px 16px' }}>Log in</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px' }}>Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
```

---

### `frontend/src/components/SkillBadge.js`

```javascript
import React from 'react';

const CLASSES = {
  Beginner: 'badge-beginner',
  Intermediate: 'badge-intermediate',
  Advanced: 'badge-advanced',
  Expert: 'badge-expert',
};

export default function SkillBadge({ skill }) {
  return <span className={`badge ${CLASSES[skill.proficiency] || ''}`}>{skill.name}</span>;
}
```

---

### `frontend/src/components/SkillCard.js`

```javascript
import React from 'react';
import { Link } from 'react-router-dom';
import SkillBadge from './SkillBadge';

function Avatar({ name, url, size = 48 }) {
  if (url) return <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />;
  const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.33 }}>
      {initials}
    </div>
  );
}

export default function SkillCard({ user }) {
  const topSkills = user.skills_offered?.slice(0, 3) || [];
  return (
    <Link to={`/profile/${user.id}`} style={{ display: 'block' }}>
      <div className="card" style={{ cursor: 'pointer', height: '100%', transition: 'box-shadow 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Avatar name={user.name} url={user.avatar_url} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
            {user.location && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {user.location}</p>}
          </div>
        </div>
        {topSkills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {topSkills.map((s, i) => <SkillBadge key={i} skill={s} />)}
            {user.skills_offered?.length > 3 && <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>+{user.skills_offered.length - 3} more</span>}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          <span style={{ color: '#f59e0b' }}>♥</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user.like_count || 0}</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{user.skills_offered?.length || 0} skill{user.skills_offered?.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </Link>
  );
}
```

---

### `frontend/src/components/SearchBar.js`

```javascript
import React from 'react';

export default function SearchBar({ value, onChange, onSearch }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        type="text" placeholder="Search skills, e.g. Python, Guitar, Spanish…"
        value={value} onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSearch()}
        style={{ flex: 1 }}
      />
      <button className="btn btn-primary" onClick={onSearch}>Search</button>
    </div>
  );
}
```

---

### `frontend/src/components/FilterPanel.js`

```javascript
import React, { useEffect, useState } from 'react';
import { apiGetCategories } from '../api/api';

export default function FilterPanel({ category, proficiency, onCategoryChange, onProficiencyChange }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    apiGetCategories().then(d => setCategories(d.categories || []));
  }, []);

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <select value={category} onChange={e => onCategoryChange(e.target.value)} style={{ minWidth: 180 }}>
        <option value="">All categories</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={proficiency} onChange={e => onProficiencyChange(e.target.value)} style={{ minWidth: 150 }}>
        <option value="">All proficiency</option>
        {['Beginner','Intermediate','Advanced','Expert'].map(p => <option key={p} value={p}>{p}</option>)}
      </select>
    </div>
  );
}
```

---

### `frontend/src/components/Pagination.js`

```javascript
import React from 'react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 32 }}>
      <button className="btn btn-ghost" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>← Prev</button>
      <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
      <button className="btn btn-ghost" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>Next →</button>
    </div>
  );
}
```

---

### `frontend/src/pages/LandingPage.js`

```javascript
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'var(--primary)', color: '#fff', padding: '72px 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 620 }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>Trade skills, not money.</h1>
          <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 32, lineHeight: 1.6 }}>
            SkillSwap connects people who have something to teach with people who have something to offer in return. No fees. No algorithms. Just people helping each other.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/browse" className="btn" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 600, padding: '14px 28px', fontSize: 16 }}>Browse skills</Link>
            {!user && <Link to="/register" className="btn" style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.6)', color: '#fff', padding: '14px 28px', fontSize: 16 }}>Sign up free</Link>}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '64px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: 40, fontSize: 26 }}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {[
              { n: '1', t: 'List your skills', d: 'Tell people what you can teach and what you want to learn.' },
              { n: '2', t: 'Browse the marketplace', d: 'Search and filter to find someone who has what you need.' },
              { n: '3', t: 'Reach out directly', d: 'Contact them by email or phone — no platform middleman.' },
              { n: '4', t: 'Leave a review', d: 'Build trust by rating your experience after a swap.' },
            ].map(item => (
              <div key={item.n} className="card" style={{ textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, margin: '0 auto 12px' }}>{item.n}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{item.t}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={{ padding: '56px 0', textAlign: 'center', background: 'var(--primary-light)' }}>
          <div className="container" style={{ maxWidth: 480 }}>
            <h2 style={{ fontSize: 26, marginBottom: 12 }}>Ready to swap?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>It takes 2 minutes to create your profile.</p>
            <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>Get started free</Link>
          </div>
        </section>
      )}
    </div>
  );
}
```

---

### `frontend/src/pages/BrowsePage.js`

```javascript
import React, { useState, useEffect, useCallback } from 'react';
import { apiBrowseUsers } from '../api/api';
import SkillCard from '../components/SkillCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';

export default function BrowsePage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [category, setCategory] = useState('');
  const [proficiency, setProficiency] = useState('');
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiBrowseUsers({ search: activeSearch, category, proficiency, page, limit: 12 });
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError('Failed to load. Is the backend running on port 8000?');
    } finally {
      setLoading(false);
    }
  }, [activeSearch, category, proficiency, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function handleSearch() { setActiveSearch(searchInput); setPage(1); }
  function handleCategory(v) { setCategory(v); setPage(1); }
  function handleProficiency(v) { setProficiency(v); setPage(1); }

  return (
    <div className="container page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, marginBottom: 4 }}>Browse skills</h1>
        <p style={{ color: 'var(--text-muted)' }}>{total > 0 ? `${total} people sharing skills` : 'Find someone to swap with'}</p>
      </div>
      <div style={{ marginBottom: 16 }}>
        <SearchBar value={searchInput} onChange={setSearchInput} onSearch={handleSearch} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <FilterPanel category={category} proficiency={proficiency} onCategoryChange={handleCategory} onProficiencyChange={handleProficiency} />
      </div>
      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && users.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>No results found.</p>
          <p>Try a different search or remove a filter.</p>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {users.map(u => <SkillCard key={u.id} user={u} />)}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
```

---

## PART 6 — FRONTEND PERSON 2 (F2)

---

### `frontend/src/components/LikeButton.js`

```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiToggleLike, apiGetLikeStatus } from '../api/api';

export default function LikeButton({ userId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && userId && user.id !== userId) {
      apiGetLikeStatus(userId).then(d => { setLiked(d.liked); setCount(d.like_count); }).catch(() => {});
    }
  }, [user, userId]);

  async function handleToggle() {
    if (!user) { navigate('/login'); return; }
    if (user.id === userId) return;
    setLoading(true);
    try {
      const d = await apiToggleLike(userId);
      setLiked(d.liked); setCount(d.like_count);
    } finally {
      setLoading(false);
    }
  }

  const isOwn = user?.id === userId;
  return (
    <button
      className={`btn ${liked ? 'btn-primary' : 'btn-ghost'}`}
      onClick={handleToggle}
      disabled={loading || isOwn}
      title={isOwn ? 'Cannot like your own profile' : liked ? 'Unlike' : 'Like'}
    >
      <span>{liked ? '♥' : '♡'}</span>
      <span>{count}</span>
    </button>
  );
}
```

---

### `frontend/src/components/ProfileHeader.js`

```javascript
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import LikeButton from './LikeButton';

function Avatar({ name, url, size = 80 }) {
  if (url) return <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />;
  const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.33 }}>
      {initials}
    </div>
  );
}

export default function ProfileHeader({ profile }) {
  const { user } = useAuth();
  const isOwn = user?.id === profile.id;
  const contact = profile.contact || {};

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <Avatar name={profile.name} url={profile.avatar_url} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>{profile.name}</h1>
            {!isOwn && <LikeButton userId={profile.id} />}
            {isOwn && <Link to="/profile/me/edit" className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 13 }}>Edit profile</Link>}
          </div>
          {profile.location && <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>📍 {profile.location}</p>}
          {profile.bio && <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{profile.bio}</p>}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {contact.show_email && <a href={`mailto:${profile.email}`} style={{ fontSize: 13, color: 'var(--primary)' }}>✉ {profile.email}</a>}
            {contact.show_phone && contact.phone && <a href={`tel:${contact.phone}`} style={{ fontSize: 13, color: 'var(--primary)' }}>📞 {contact.phone}</a>}
            {!contact.show_email && !contact.show_phone && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No contact info shown.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### `frontend/src/components/SkillList.js`

```javascript
import React from 'react';
import SkillBadge from './SkillBadge';

export default function SkillList({ skillsOffered = [], skillsWanted = [] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
      <div className="card">
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: 'var(--primary)' }}>Skills offered</h2>
        {skillsOffered.length === 0
          ? <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No skills listed yet.</p>
          : skillsOffered.map((s, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                  <SkillBadge skill={s} />
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.category}</p>
                {s.description && <p style={{ fontSize: 13, marginTop: 4 }}>{s.description}</p>}
              </div>
            ))
        }
      </div>
      <div className="card">
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: 'var(--accent)' }}>Skills wanted</h2>
        {skillsWanted.length === 0
          ? <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No skills listed.</p>
          : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skillsWanted.map((s, i) => (
                <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px' }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{s.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>{s.category}</span>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}
```

---

### `frontend/src/components/ReviewCard.js`

```javascript
import React from 'react';

export default function ReviewCard({ review }) {
  const date = new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  return (
    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
          {review.reviewer_name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: 13 }}>{review.reviewer_name}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{date}</p>
        </div>
        <div style={{ marginLeft: 4 }}>
          {[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= review.rating ? '#f59e0b' : '#d1d5db', fontSize: 14 }}>★</span>)}
        </div>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.6 }}>{review.comment}</p>
    </div>
  );
}
```

---

### `frontend/src/components/ReviewForm.js`

```javascript
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiCreateReview, apiUpdateReview } from '../api/api';

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ fontSize: 28, cursor: 'pointer', color: n <= (hover || value) ? '#f59e0b' : '#d1d5db' }}
          onClick={() => onChange(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}>★</span>
      ))}
    </div>
  );
}

export default function ReviewForm({ targetUserId, existingReview, onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return (
    <div style={{ padding: '16px 0' }}>
      <button className="btn btn-outline" onClick={() => navigate('/login')} style={{ marginRight: 8 }}>Log in</button>
      <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>to leave a review.</span>
    </div>
  );

  if (user.id === targetUserId) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    if (!comment.trim()) { setError('Please write a comment.'); return; }
    setError(''); setLoading(true);
    try {
      if (existingReview) {
        await apiUpdateReview(targetUserId, rating, comment);
      } else {
        await apiCreateReview(targetUserId, rating, comment);
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--bg)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{existingReview ? 'Edit your review' : 'Leave a review'}</h3>
      <StarPicker value={rating} onChange={setRating} />
      <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Describe your experience…" maxLength={500} style={{ width: '100%', marginBottom: 8 }} />
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{comment.length}/500</p>
      {error && <p className="error-text" style={{ marginBottom: 8 }}>{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Submitting…' : existingReview ? 'Update review' : 'Submit review'}</button>
    </form>
  );
}
```

---

### `frontend/src/pages/ProfilePage.js`

```javascript
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { apiGetUser, apiGetReviews, apiDeleteReview } from '../api/api';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '../components/ProfileHeader';
import SkillList from '../components/SkillList';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';

export default function ProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviewData, setReviewData] = useState({ reviews: [], average_rating: null, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const myReview = reviewData.reviews.find(r => r.reviewer_id === user?.id);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [p, r] = await Promise.all([apiGetUser(id), apiGetReviews(id)]);
      setProfile(p); setReviewData(r);
    } catch {
      setError('User not found.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleDeleteReview() {
    if (!window.confirm('Delete your review?')) return;
    try { await apiDeleteReview(id); fetchAll(); }
    catch (err) { alert(err.message); }
  }

  if (loading) return <div className="container page"><p style={{ color: 'var(--text-muted)' }}>Loading…</p></div>;
  if (error || !profile) return <div className="container page"><p className="error-text">{error || 'User not found.'}</p></div>;

  return (
    <div className="container page">
      <ProfileHeader profile={profile} />
      <SkillList skillsOffered={profile.skills_offered} skillsWanted={profile.skills_wanted} />

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600 }}>Reviews</h2>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{reviewData.total} total</span>
          {reviewData.average_rating && <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>★ {reviewData.average_rating}</span>}
        </div>

        {user && user.id !== profile.id && (
          <ReviewForm targetUserId={id} existingReview={myReview} onSuccess={fetchAll} />
        )}

        {myReview && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 11 }} onClick={handleDeleteReview}>Delete my review</button>
          </div>
        )}

        {reviewData.reviews.length === 0
          ? <p style={{ fontSize: 14, color: 'var(--text-muted)', padding: '16px 0' }}>No reviews yet. Be the first!</p>
          : reviewData.reviews.map(r => <ReviewCard key={r.id} review={r} />)
        }
      </div>
    </div>
  );
}
```

---

## PART 7 — RUNNING THE PROJECT

### Start the backend

```bash
cd backend
pip install -r requirements.txt

# Create .env file with your MONGO_URL (see Part 1)

python seed.py          # populate DB with 10 demo users
uvicorn main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` — Swagger UI shows all endpoints. Use it to test before connecting frontend.

### Start the frontend

```bash
cd frontend
npm install
npm start
```

Runs at `http://localhost:3000`. Both must be running at the same time.

### Smoke test checklist

- `http://localhost:8000/docs` — Swagger loads
- `http://localhost:3000` — Landing page renders
- `/browse` — seeded cards appear
- Click a card — profile page loads with skills
- `/register` — create account, redirect to edit profile
- Add skills, save — redirect to profile
- Like another user — count increments
- Leave a review — appears immediately

---

## PART 8 — GIT WORKFLOW

```bash
# Everyone on day 1:
git clone <repo-url>
git checkout -b feat/your-name

# Work, then commit often:
git add .
git commit -m "feat: add browse page with filters"
git push origin feat/your-name
# Open PR to main when feature is done
```

**Minimum commits required per person:**

| Person | Min commits | Examples |
|--------|-------------|---------|
| B1 | 4 | setup + models, auth endpoints, users endpoints, seed |
| B2 | 3 | categories + reviews, likes, fixes |
| F1 | 4 | setup + navbar, landing page, browse page, skill card components |
| F2 | 3 | profile page, review components, like button |
| F3 | 4 | auth context + api.js, register + login, edit profile, polish |

---

## PART 9 — FINAL SUBMISSION CHECKLIST

- [ ] `python seed.py` run — 10+ users in DB
- [ ] All 6 pages load without errors in the browser console
- [ ] Full demo flow works: register → edit → browse → view profile → like → review
- [ ] Search returns correct results
- [ ] Category and proficiency filters work
- [ ] Cannot like your own profile (button disabled)
- [ ] Cannot review your own profile (form hidden)
- [ ] One review per user per profile enforced (duplicate gives error)
- [ ] JWT sent correctly — protected routes work, and redirect to /login if not logged in
- [ ] Everyone has 3+ commits on the repo
- [ ] `.env` is in `.gitignore` — not committed
- [ ] GitHub repo link is ready
- [ ] Slides prepared: problem → solution → live demo

---

*Single source of truth. When in doubt, refer here.*
