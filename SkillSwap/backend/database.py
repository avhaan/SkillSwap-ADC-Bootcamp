from pymongo import AsyncMongoClient
from pymongo import ReturnDocument
from dotenv import load_dotenv
import os


load_dotenv()
MONGO_URL = os.getenv("MONGO_URL")

client = AsyncMongoClient(MONGO_URL)
db = client.skillswap
