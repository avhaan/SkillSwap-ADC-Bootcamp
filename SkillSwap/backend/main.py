from fastapi import FastAPI
from .routers import auth_router, users_router, categories_router, reviews_router, likes_router, matches_router

from contextlib import asynccontextmanager
from .database import create_indexes
from fastapi.middleware.cors import CORSMiddleware



# basically takes care of startup code, makes sure indexes are created for email for users
@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_indexes()
    yield


app = FastAPI(title="SkillSwap API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def home():
    return {"message": "API is online"}
# B1 Routers
app.include_router(auth_router.router)
app.include_router(users_router.router)
# B2 Routers 
app.include_router(categories_router.router)
app.include_router(reviews_router.router)
app.include_router(likes_router.router)