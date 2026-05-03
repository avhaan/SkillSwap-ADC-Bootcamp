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