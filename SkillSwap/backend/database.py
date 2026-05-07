from pymongo import AsyncMongoClient
from pymongo import ReturnDocument
from dotenv import load_dotenv
import os


load_dotenv()
MONGO_URL = os.getenv("MONGO_URL")

client = AsyncMongoClient(MONGO_URL)
db = client.skillswap

users_collection = db["users"]
reviews_collection = db["reviews"]
likes_collection = db["likes"]
matches_collection = db["matches"]


async def create_indexes():
    await users_collection.create_index("email", unique = True)
    await matches_collection.create_index("pair_key", unique=True)