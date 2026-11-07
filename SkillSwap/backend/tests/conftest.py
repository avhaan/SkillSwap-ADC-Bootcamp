"""Isolated HTTP tests: no live MongoDB or production credentials required."""
import os
from unittest.mock import AsyncMock

os.environ["MONGO_URL"] = "mongodb://127.0.0.1:27017"
os.environ["SECRET_KEY"] = "test-only-secret"

import pytest
from fastapi.testclient import TestClient
from SkillSwap.backend.main import app
from SkillSwap.backend.routers import matches_router


@pytest.fixture
def collections(monkeypatch):
    matches = AsyncMock()
    users = AsyncMock()
    monkeypatch.setattr(matches_router, "matches_collection", matches)
    monkeypatch.setattr(matches_router, "users_collection", users)
    return matches, users


@pytest.fixture
def client(collections):
    # Omitting the context manager deliberately skips MongoDB index startup.
    with_client = TestClient(app)
    yield with_client
    with_client.close()
