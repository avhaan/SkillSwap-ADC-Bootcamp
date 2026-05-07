from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os


load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
MONGO_URL = os.getenv("MONGO_URI") or os.getenv("MONGO_URL")

client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
db = client.skillswap

users_collection = db["users"]
reviews_collection = db["reviews"]
likes_collection = db["likes"]



async def create_indexes():
    if not MONGO_URL:
        print("Startup warning: MONGO_URI is missing")
        return

    await users_collection.create_index("email", unique = True)
