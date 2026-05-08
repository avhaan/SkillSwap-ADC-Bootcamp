from fastapi import APIRouter, Depends
from bson import ObjectId
from ..auth import get_current_user_id
from ..database import matches_collection, users_collection
from pymongo.errors import DuplicateKeyError



router = APIRouter(prefix="/api/matches", tags=["matches"])

#creates a key for a pair
def make_pair_key(user_id_1: str, user_id_2: str) -> str:
    ids = sorted([user_id_1, user_id_2])
    return f"{ids[0]}_{ids[1]}"




@router.post("/{user_id}")
async def send_match_request(
    user_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    if user_id == current_user_id:
        return {"error": "You cannot match yourself"}

    receiver = await users_collection.find_one({"_id": ObjectId(user_id)})

    if receiver is None:
        return {"error": "User not found"}

    current_user = await users_collection.find_one({"_id": ObjectId(current_user_id)})

    if current_user is None:
        return {"error": "Current user not found"}

    pair_key = make_pair_key(current_user_id, user_id)

    new_match = {
        "requester_id": current_user_id,
        "requester_name": current_user["name"],
        "receiver_id": user_id,
        "receiver_name": receiver["name"],
        "status": "pending",
        "pair_key": pair_key,
    }

    try:
        result = await matches_collection.insert_one(new_match)
    except DuplicateKeyError:
        return {"error": "Match request already exists"}
        
    new_match["_id"] = str(result.inserted_id)

    return new_match




@router.get("/me")
async def get_my_matches(current_user_id: str = Depends(get_current_user_id)):
    current_matches = []
    incoming_pending = []
    outgoing_pending = []

    # accepted matches where I am either requester or receiver
    async for match in matches_collection.find({
        "status": "accepted",
        "$or": [
            {"requester_id": current_user_id},
            {"receiver_id": current_user_id}
        ]
    }):
        match["_id"] = str(match["_id"])
        current_matches.append(match)

    # pending requests sent TO me
    async for match in matches_collection.find({
        "status": "pending",
        "receiver_id": current_user_id
    }):
        match["_id"] = str(match["_id"])
        incoming_pending.append(match)

    # pending requests sent BY me
    async for match in matches_collection.find({
        "status": "pending",
        "requester_id": current_user_id
    }):
        match["_id"] = str(match["_id"])
        outgoing_pending.append(match)

    return {
        "current_matches": current_matches,
        "incoming_pending": incoming_pending,
        "outgoing_pending": outgoing_pending
    }


@router.put("/{match_id}/accept")
async def accept_match(
    match_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    match = await matches_collection.find_one({"_id": ObjectId(match_id)})

    if match is None:
        return {"error": "Match request not found"}

    if match["receiver_id"] != current_user_id:
        return {"error": "Only the receiver can accept this request"}

    if match["status"] != "pending":
        return {"error": "Only pending requests can be accepted"}

    await matches_collection.update_one(
        {"_id": ObjectId(match_id)},
        {
            "$set": {
                "status": "accepted"
            }
        }
    )

    updated_match = await matches_collection.find_one({"_id": ObjectId(match_id)})
    updated_match["_id"] = str(updated_match["_id"])

    return updated_match





@router.put("/{match_id}/decline")
async def decline_match(
    match_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    match = await matches_collection.find_one({"_id": ObjectId(match_id)})

    if match is None:
        return {"error": "Match request not found"}

    if match["receiver_id"] != current_user_id:
        return {"error": "Only the receiver can decline this request"}

    if match["status"] != "pending":
        return {"error": "Only pending requests can be declined"}

    await matches_collection.delete_one({"_id": ObjectId(match_id)})

    return {"message": "Match request declined"}






@router.get("/{user_id}/status")
async def get_match_status(
    user_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    if user_id == current_user_id:
        return {"status": "self"}

    pair_key = make_pair_key(current_user_id, user_id)

    match = await matches_collection.find_one({"pair_key": pair_key})

    if match is None:
        return {"status": "none"}

    if match["status"] == "accepted":
        return {"status": "matched"}

    if match["status"] == "pending":
        if match["requester_id"] == current_user_id:
            return {"status": "pending_sent"}

        if match["receiver_id"] == current_user_id:
            return {"status": "pending_received"}

    return {"status": match["status"]}


