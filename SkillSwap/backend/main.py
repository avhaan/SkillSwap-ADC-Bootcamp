from fastapi import FastAPI
from .routers import auth_router, users_router, categories_router, reviews_router, likes_router


app = FastAPI(title="SkillSwap API")

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