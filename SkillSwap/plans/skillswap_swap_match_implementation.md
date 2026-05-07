# SkillSwap - Swap Match Implementation Plan
> Feature add-on for final demo | Goal: show current matches, pending matches, and send match requests from profiles

---

## 1. Feature Summary

**Swap Match** adds a lightweight matching workflow on top of the existing SkillSwap marketplace.

The user can:

1. Browse profiles.
2. Open another user's profile.
3. Click **Send Match Request**.
4. View outgoing and incoming pending requests on a new **Matches** page.
5. Accept or decline incoming requests.
6. See accepted matches as **Current Matches**.

This feature should feel impressive in the demo, but stay simple enough for beginner implementation. It does not need chat, calendar scheduling, payment, AI, or real-time notifications.

---

## 2. Demo Flow

Use this exact flow for the final presentation:

1. Log in as User A.
2. Browse users and open User B's profile.
3. Click **Send Match Request**.
4. Switch/login as User B.
5. Go to `/matches`.
6. See User A under **Pending Requests**.
7. Click **Accept**.
8. User A and User B now appear under **Current Matches**.

Optional polish if time allows:

- Show a small badge on profile pages: `Request pending`, `Matched`, or `Send Match Request`.
- Show skill overlap text like `You want Guitar. They offer Guitar.`

---

## 3. Data Model

Add a new MongoDB collection:

### matches

```json
{
  "_id": "ObjectId",
  "requester_id": "ObjectId as string",
  "requester_name": "string",
  "receiver_id": "ObjectId as string",
  "receiver_name": "string",
  "status": "pending | accepted | declined",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Rules

- A user cannot send a match request to themself.
- A user should not be able to create duplicate pending/accepted requests with the same other user.
- Either direction counts as the same pair.
  - If A requests B, B should not also be able to create a second request to A.
- Only the receiver can accept or decline a pending request.
- Accepted matches show on both users' Matches page.

---

## 4. Backend Endpoints

Add a new router:

```txt
backend/routers/matches_router.py
```

Register it in:

```txt
backend/main.py
```

### Endpoint List

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | `/api/matches/{user_id}` | Send a match request to another user | Yes |
| GET | `/api/matches/me` | Get current user's current + pending matches | Yes |
| PUT | `/api/matches/{match_id}/accept` | Accept incoming request | Yes |
| PUT | `/api/matches/{match_id}/decline` | Decline incoming request | Yes |
| GET | `/api/matches/{user_id}/status` | Check relationship status with a profile | Yes |

### Recommended Response for `GET /api/matches/me`

```json
{
  "current_matches": [],
  "incoming_pending": [],
  "outgoing_pending": []
}
```

This response shape makes the frontend Matches page easy to build.

---

## 5. Frontend Pages and Components

Add a new route:

```txt
/matches
```

Add new files:

```txt
src/pages/MatchesPage.jsx
src/matches-page/style.css
src/matches-page/components/MatchCard.jsx
src/matches-page/components/MatchSection.jsx
```

Update existing files:

```txt
src/App.jsx
src/components/Navbar.jsx
src/api/api.jsx
src/pages/ProfilePage.jsx
src/profile-page/components/ProfileHeader.jsx
```

---

## 6. Person-by-Person Work Split

## B1 - Backend 1

**Owner of database setup and shared backend wiring.**

### Files

```txt
backend/database.py
backend/main.py
backend/models.py
```

### Tasks

- Add `matches_collection = db["matches"]` in `database.py`.
- Add match-related indexes in `create_indexes()`.
- Register `matches_router` in `main.py`.
- Add simple Pydantic schemas in `models.py` if the team wants response models.
- Make sure backend still starts after the new router is registered.

### Suggested Indexes

```python
await matches_collection.create_index("requester_id")
await matches_collection.create_index("receiver_id")
await matches_collection.create_index("status")
```

If time allows, add a pair key to prevent duplicates:

```json
{
  "pair_key": "smallerUserId_largerUserId"
}
```

Then index:

```python
await matches_collection.create_index("pair_key", unique=True)
```

### Done When

- Backend has access to `matches_collection`.
- `main.py` includes the new matches router.
- Backend compiles with `python3 -m compileall backend`.

---

## B2 - Backend 2

**Owner of match request API behavior.**

### Files

```txt
backend/routers/matches_router.py
```

### Tasks

- Create the new matches router.
- Implement `POST /api/matches/{user_id}`.
- Implement `GET /api/matches/me`.
- Implement `PUT /api/matches/{match_id}/accept`.
- Implement `PUT /api/matches/{match_id}/decline`.
- Implement `GET /api/matches/{user_id}/status`.
- Block self-match requests.
- Block duplicate match requests.
- Make sure only the receiver can accept/decline.

### Simple Status Logic

Use these statuses:

```txt
none
pending_sent
pending_received
matched
declined
```

The profile page can use this to decide which button text to show.

### Done When

- Swagger can send a request from User A to User B.
- User B can accept it.
- Both users see the accepted match from `GET /api/matches/me`.
- Duplicate requests do not create duplicate match documents.

---

## F1 - Frontend 1

**Owner of navigation and marketplace entry points.**

### Files

```txt
src/components/Navbar.jsx
src/components/Navbar.css
src/browse-page/components/SkillCard.jsx
src/browse-page/style.css
```

### Tasks

- Add a **Matches** link to the Navbar.
- Make the Navbar show the link only when logged in if easy; otherwise always show it.
- Add a small visual marker on Browse cards if a user is already matched or pending.
- Keep card click behavior going to `/profile/:user_id`.
- Polish the Browse card UI so the feature feels intentional.

### Optional Polish

Add a small pill on cards:

```txt
Matched
Pending
Open profile
```

### Done When

- User can navigate to `/matches` from the Navbar.
- Browse cards still render correctly.
- The feature is discoverable without explaining it verbally.

---

## F2 - Frontend 2

**Owner of profile-page match request UI.**

### Files

```txt
src/pages/ProfilePage.jsx
src/profile-page/components/ProfileHeader.jsx
src/profile-page/style.css
```

Optional new component:

```txt
src/profile-page/components/MatchRequestButton.jsx
```

### Tasks

- Add a **Send Match Request** button on other users' profiles.
- Hide the button on the user's own profile.
- Call the match status API when the profile loads.
- Change the button based on status:
  - `none` -> `Send Match Request`
  - `pending_sent` -> `Request Sent`
  - `pending_received` -> `They Requested You`
  - `matched` -> `Matched`
- Disable the button after a request is sent.
- Show a small success message after sending.

### Optional Polish

Add a small match explanation card:

```txt
Possible Swap
You may be able to trade one of your offered skills for one of theirs.
```

### Done When

- A logged-in user can send a match request from a profile page.
- The profile UI does not show the button on your own profile.
- Button text clearly changes after sending.

---

## F3 - Frontend 3

**Owner of API utilities and the Matches page.**

### Files

```txt
src/api/api.jsx
src/App.jsx
src/pages/MatchesPage.jsx
src/matches-page/style.css
src/matches-page/components/MatchCard.jsx
src/matches-page/components/MatchSection.jsx
```

### Tasks

- Add API functions:
  - `apiSendMatchRequest(userID)`
  - `apiGetMyMatches()`
  - `apiAcceptMatch(matchID)`
  - `apiDeclineMatch(matchID)`
  - `apiGetMatchStatus(userID)`
- Add route:

```jsx
<Route path="/matches" element={<MatchesPage />} />
```

- Build `MatchesPage`.
- Show three sections:
  - **Current Matches**
  - **Incoming Requests**
  - **Sent Requests**
- Add Accept and Decline buttons only for incoming requests.
- After accept/decline, refresh the matches list.

### Done When

- `/matches` loads for a logged-in user.
- Incoming requests can be accepted or declined.
- Accepted requests move to Current Matches.
- Sent requests show as pending.

---

## 7. Suggested API Utility Functions

Add these to:

```txt
src/api/api.jsx
```

```js
export async function apiSendMatchRequest(userID) {
  const res = await fetch(`${BASE}/api/matches/${userID}`, {
    method: "POST",
    headers: authHeaders(),
  });

  return handleResponse(res);
}

export async function apiGetMyMatches() {
  const res = await fetch(`${BASE}/api/matches/me`, {
    headers: authHeaders(),
  });

  return handleResponse(res);
}

export async function apiAcceptMatch(matchID) {
  const res = await fetch(`${BASE}/api/matches/${matchID}/accept`, {
    method: "PUT",
    headers: authHeaders(),
  });

  return handleResponse(res);
}

export async function apiDeclineMatch(matchID) {
  const res = await fetch(`${BASE}/api/matches/${matchID}/decline`, {
    method: "PUT",
    headers: authHeaders(),
  });

  return handleResponse(res);
}

export async function apiGetMatchStatus(userID) {
  const res = await fetch(`${BASE}/api/matches/${userID}/status`, {
    headers: authHeaders(),
  });

  return handleResponse(res);
}
```

---

## 8. Beginner-Safe Implementation Order

Follow this order so people do not block each other.

### Step 1 - Backend Skeleton

B1 creates collection wiring and registers the router.

B2 creates empty route functions that return simple placeholder JSON.

Example:

```python
return {"message": "matches route works"}
```

### Step 2 - API Layer and Route

F3 adds the frontend API functions and `/matches` route.

The page can start with hardcoded placeholder sections.

### Step 3 - Real Request Creation

B2 implements sending a match request and getting current user's match lists.

F3 connects the Matches page to real data.

### Step 4 - Profile Button

F2 adds Send Match Request to ProfileHeader/ProfilePage.

F2 connects it to `apiSendMatchRequest`.

### Step 5 - Accept/Decline

B2 implements accept and decline.

F3 connects buttons on MatchesPage.

### Step 6 - Navbar and Polish

F1 adds Navbar link, card badges, and final visual polish.

Everyone tests the demo flow.

---

## 9. Minimum Version for Demo

If time is short, ship only this:

- `POST /api/matches/{user_id}`
- `GET /api/matches/me`
- `PUT /api/matches/{match_id}/accept`
- `/matches` page
- Send Match Request button on profile page
- Navbar link to Matches

Skip:

- Decline button
- Match status on Browse cards
- Fancy match score
- Notifications
- Chat

---

## 10. Final Demo Checklist

- [ ] User A can register or log in.
- [ ] User B can register or log in.
- [ ] User A can open User B's profile.
- [ ] User A can send a match request.
- [ ] User B can see the request on `/matches`.
- [ ] User B can accept the request.
- [ ] User A can see User B under Current Matches.
- [ ] User B can see User A under Current Matches.
- [ ] User cannot send a request to themself.
- [ ] Duplicate request does not create duplicate pending cards.
- [ ] Navbar has a clear Matches link.
- [ ] Build passes with `npm run build`.
- [ ] Backend compiles with `python3 -m compileall backend`.

---

## 11. What Not To Build Tonight

Do not build these unless everything above is already done:

- Real-time notifications
- Chat messages
- Calendar scheduling
- Gemini/AI messages
- Camera/photo matching
- Complex match scoring
- Email sending

Those are cool, but they are more likely to break the demo than improve it.
