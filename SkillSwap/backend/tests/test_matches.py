from unittest.mock import AsyncMock

import pytest
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from SkillSwap.backend.auth import create_access_token
from SkillSwap.backend.database import create_indexes
from SkillSwap.backend import database

SENDER = "000000000000000000000001"
RECEIVER = "000000000000000000000002"
OTHER = "000000000000000000000003"
MATCH = "000000000000000000000004"


def headers(user):
    return {"Authorization": f"Bearer {create_access_token(user)}"}


def match(status="pending"):
    return {"_id": ObjectId(MATCH), "requester_id": SENDER,
            "receiver_id": RECEIVER, "status": status}


@pytest.mark.parametrize("method,path", [
    ("post", f"/{RECEIVER}"), ("get", "/me"),
    ("put", f"/{MATCH}/accept"), ("put", f"/{MATCH}/decline"),
    ("delete", f"/{RECEIVER}"), ("get", f"/{RECEIVER}/status"),
])
def test_match_endpoints_require_authentication(client, collections, method, path):
    response = getattr(client, method)("/api/matches" + path)
    assert response.status_code in (401, 403)
    collections[0].find_one.assert_not_awaited()


def test_invalid_token(client):
    assert client.get("/api/matches/me", headers={"Authorization": "Bearer invalid"}).status_code == 401


@pytest.mark.parametrize("action", ["accept", "decline"])
@pytest.mark.parametrize("actor", [SENDER, OTHER])
def test_only_receiver_can_respond(client, collections, action, actor):
    matches, _ = collections
    matches.find_one.return_value = match()
    response = client.put(f"/api/matches/{MATCH}/{action}", headers=headers(actor))
    assert response.json() == {"error": f"Only the receiver can {action} this request"}
    matches.update_one.assert_not_awaited()
    matches.delete_one.assert_not_awaited()


@pytest.mark.parametrize("action", ["accept", "decline"])
def test_receiver_can_respond(client, collections, action):
    matches, _ = collections
    matches.find_one.side_effect = [match(), match("accepted")]
    response = client.put(f"/api/matches/{MATCH}/{action}", headers=headers(RECEIVER))
    assert response.status_code == 200
    if action == "accept":
        assert response.json()["status"] == "accepted"
        matches.update_one.assert_awaited_once()
    else:
        assert response.json() == {"message": "Match request declined"}
        matches.delete_one.assert_awaited_once()


@pytest.mark.parametrize("action", ["accept", "decline"])
def test_accepted_request_cannot_be_answered_again(client, collections, action):
    collections[0].find_one.return_value = match("accepted")
    response = client.put(f"/api/matches/{MATCH}/{action}", headers=headers(RECEIVER))
    assert "Only pending requests" in response.json()["error"]
    collections[0].update_one.assert_not_awaited()
    collections[0].delete_one.assert_not_awaited()


def test_receiver_cannot_cancel_pending_request(client, collections):
    collections[0].find_one.return_value = match()
    response = client.delete(f"/api/matches/{SENDER}", headers=headers(RECEIVER))
    assert response.json() == {"error": "Only the requester can cancel this pending request"}
    collections[0].delete_one.assert_not_awaited()


@pytest.mark.parametrize("actor,target,status", [
    (SENDER, RECEIVER, "pending"), (SENDER, RECEIVER, "accepted"),
    (RECEIVER, SENDER, "accepted"),
])
def test_participant_can_remove_match(client, collections, actor, target, status):
    collections[0].find_one.return_value = match(status)
    response = client.delete(f"/api/matches/{target}", headers=headers(actor))
    assert response.json() == {"message": "Match removed"}
    collections[0].delete_one.assert_awaited_once()


def test_cannot_match_self(client, collections):
    response = client.post(f"/api/matches/{SENDER}", headers=headers(SENDER))
    assert response.json() == {"error": "You cannot match yourself"}
    collections[0].insert_one.assert_not_awaited()


@pytest.mark.parametrize("actor,target", [(SENDER, RECEIVER), (RECEIVER, SENDER)])
def test_duplicate_pair_in_either_direction(client, collections, actor, target):
    matches, users = collections
    users.find_one.side_effect = [{"name": "Target"}, {"name": "Actor"}]
    matches.insert_one.side_effect = DuplicateKeyError("duplicate pair")
    response = client.post(f"/api/matches/{target}", headers=headers(actor))
    assert response.json() == {"error": "Match request already exists"}
    assert matches.insert_one.call_args.args[0]["pair_key"] == f"{SENDER}_{RECEIVER}"


def test_new_request_is_pending(client, collections):
    matches, users = collections
    users.find_one.side_effect = [{"name": "Receiver"}, {"name": "Sender"}]
    matches.insert_one.return_value.inserted_id = ObjectId(MATCH)
    response = client.post(f"/api/matches/{RECEIVER}", headers=headers(SENDER))
    assert response.status_code == 200
    assert response.json()["status"] == "pending"
    assert response.json()["requester_id"] == SENDER


def test_unique_pair_index_is_created(monkeypatch):
    import asyncio
    users, matches = AsyncMock(), AsyncMock()
    monkeypatch.setattr(database, "users_collection", users)
    monkeypatch.setattr(database, "matches_collection", matches)
    asyncio.run(create_indexes())
    matches.create_index.assert_awaited_once_with("pair_key", unique=True)


@pytest.mark.parametrize("method,path", [
    ("post", "/invalid"), ("delete", "/invalid"),
    ("put", "/invalid/accept"), ("put", "/invalid/decline"),
    ("get", "/invalid/status"),
])
def test_malformed_match_ids_return_validation_error(client, collections, method, path):
    response = getattr(client, method)("/api/matches" + path, headers=headers(SENDER))
    assert response.status_code == 422
    collections[0].find_one.assert_not_awaited()
    collections[1].find_one.assert_not_awaited()
