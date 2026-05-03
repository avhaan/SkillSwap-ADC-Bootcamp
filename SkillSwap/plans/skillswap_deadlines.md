# SkillSwap — Deadlines
> Hackathon Spring 2026 | Final submission: May 7 @ 11:59pm

Missing a deadline doesn't just hurt you — it blocks your teammates.
If you're going to miss something, say so in the group chat **before** it's due.

---

## B1 — Backend 1

| Deadline | Task |
|----------|------|
| **Apr 28 @ 11pm** | Repo created, folder structure pushed, `requirements.txt`, `.env.example`, `database.py`, `models.py` committed — B2 is blocked until this is done |
| **Apr 29 @ 11pm** | `auth.py`, `auth_router.py`, `main.py` done — register + login returning real JWTs |
| **Apr 30 @ 11pm** | `users_router.py` done — GET /users, GET /users/:id, PUT /me all working in Swagger |
| **May 2 @ 11pm** | `seed.py` committed and run — 10 users in the shared Atlas DB |
| **May 4 @ 6pm** | Bug fixes done, all your endpoints pass a full manual test in Swagger |

---

## B2 — Backend 2

| Deadline | Task |
|----------|------|
| **Apr 29 @ 11pm** | `categories_router.py` done (easiest one, no excuse) — GET /categories working |
| **Apr 30 @ 11pm** | `reviews_router.py` done — all 4 endpoints (GET, POST, PUT, DELETE) working in Swagger |
| **May 1 @ 11pm** | `likes_router.py` done — toggle + status endpoints working, like_count incrementing correctly |
| **May 2 @ 11pm** | Search + filter logic in GET /users tested with real queries — "guitar", category filter, proficiency filter all returning correct results |
| **May 4 @ 6pm** | Bug fixes done, duplicate review and self-like both correctly blocked |

---

## F3 — Frontend 3 (Auth + API layer)

| Deadline | Task |
|----------|------|
| **Apr 29 @ 12pm** | `AuthContext.js` pushed — F1 and F2 are waiting on this to stop using mock data |
| **Apr 29 @ 11pm** | `api.js` pushed with all fetch functions — every endpoint covered, F1 and F2 can import from it |
| **Apr 30 @ 11pm** | `RegisterPage.js` and `LoginPage.js` done — real registration and login working end to end |
| **May 2 @ 11pm** | `EditProfilePage.js` done — save profile with skills works, redirect to profile page works |
| **May 4 @ 6pm** | `index.css` polished, all forms look consistent, no layout breaks on any page |

---

## F1 — Frontend 1 (Landing + Browse)

| Deadline | Task |
|----------|------|
| **Apr 29 @ 11pm** | `Navbar.js`, `SkillBadge.js`, `SkillCard.js` done with mock data |
| **Apr 30 @ 11pm** | `LandingPage.js` done and looking good |
| **May 1 @ 11pm** | `SearchBar.js`, `FilterPanel.js`, `Pagination.js` done |
| **May 2 @ 11pm** | `BrowsePage.js` wired to real API — cards loading from the actual DB, search works, filters work |
| **May 4 @ 6pm** | Browse grid looks polished, no broken layouts, empty state handled |

---

## F2 — Frontend 2 (Profile + Reviews + Likes)

| Deadline | Task |
|----------|------|
| **Apr 30 @ 11pm** | `ProfileHeader.js`, `SkillList.js` done with mock profile data |
| **May 1 @ 11pm** | `ReviewCard.js`, `ReviewForm.js` (star picker working), `LikeButton.js` done |
| **May 2 @ 11pm** | `ProfilePage.js` fully wired to real API — profile loads, reviews load, like button works |
| **May 3 @ 11pm** | Review create + edit + delete all working end to end on a real profile |
| **May 4 @ 6pm** | Profile page polished, all edge cases handled (no reviews, no skills, own profile) |

---

## Everyone — Final stretch

| Deadline | Task |
|----------|------|
| **May 4 @ 11pm** | Full demo walkthrough passes with zero crashes. If it breaks, fix it tonight. |
| **May 5 @ 11pm** | Slides done. Problem, solution, demo plan, tech stack. Not a placeholder deck. |
| **May 6 @ 11pm** | Seed DB refreshed with clean data. Demo script rehearsed at least once out loud. |
| **May 7 @ 6pm** | Everyone has 3+ commits. Final code pushed. One last test of the full flow. |
| **May 7 @ 11:59pm** | **Submit.** |
