from fastapi import FastAPI
from .routers import auth_router, users_router, categories_router, reviews_router, likes_router
from contextlib import asynccontextmanager
from .database import create_indexes



# basically takes care of startup code, makes sure indexes are created for email for users
@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_indexes()
    yield


app = FastAPI(title="SkillSwap API", lifespan=lifespan)

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