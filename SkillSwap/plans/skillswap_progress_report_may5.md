# SkillSwap - May 5 Progress Report and Updated Deadlines

> Hackathon Spring 2026 | Final submission: May 7 @ 11:59pm

This is a separate progress report. The original deadline file should stay as
the original schedule.

---

## Current Status - May 5

### Done or mostly done

- React/Vite app exists and `npm run build` passes.
- FastAPI backend files compile with `python3 -m compileall backend`.
- Core routes are registered in `backend/main.py`: auth, users, categories,
  reviews, and likes.
- Register page is wired to the backend and logs in the new user.
- Browse page calls the backend users API and renders a card grid.
- Categories endpoint exists.
- Reviews endpoints exist for GET, POST, PUT, and DELETE.
- Likes endpoints exist for toggle and status.
- Frontend pages/components exist for landing, browse, register, login,
  edit profile, profile detail, reviews, and likes.

### Biggest blockers left

- `backend/routers/users_router.py` does not yet support search, category
  filter, proficiency filter, pagination metadata, or DELETE `/api/users/me`.
- Mongo indexes are incomplete: only the email index is created right now.
- `src/App.jsx` does not define `/profile/:id`.
- `src/pages/ProfilePage.jsx` still uses mock profile and mock review data.
- `src/pages/EditProfilePage.jsx` still saves with `console.log`.
- `src/pages/LoginPage.jsx` references `login` and `navigate`, but does not
  wire `useAuth` or `useNavigate`.
- `src/browse-page/components/SkillCard.jsx` references `navigate` without
  defining it.
- `src/profile-page/components/LikeButton.jsx` is still local state only.
- Full demo flow has not been validated end to end:
  register -> edit profile -> browse -> view profile -> like -> review.

---

## Updated Deadlines

### May 5 @ 6pm - unblock the demo path

| Person          | Remainder of work                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1 - Backend 1  | Finish `users_router.py`: search, category filter, proficiency filter, pagination response, GET by id, PUT `/me`, DELETE `/me`, and real HTTP errors. |
| B1 - Backend 1  | Finish Mongo indexes and fill/run `seed.py` with 10-15 realistic demo users.                                                                          |
| B2 - Backend 2  | Swagger-test reviews and likes with real users: duplicate review, self-review, self-like, edit/delete review, and like count.                         |
| F1 - Frontend 1 | Fix `SkillCard.jsx` navigation, restore skill badges, and make Browse refetch on search/filter/page changes.                                          |
| F2 - Frontend 2 | Replace mock ProfilePage data with real profile/review API calls and wire LikeButton to the backend.                                                  |
| F3 - Frontend 3 | Fix LoginPage runtime errors and wire EditProfilePage to load/save the current user.                                                                  |

### May 5 @ 11pm - first complete demo attempt

| Person   | Remainder of work                                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------- |
| B1       | Confirm seeded users appear from GET `/api/users/?page=1&limit=12`.                                       |
| B2       | Confirm review and like edge cases still work after seeded data is refreshed.                             |
| F1       | Confirm Browse search, filters, pagination, empty state, and card click all work.                         |
| F2       | Confirm profile detail loads by real id, reviews display, review form works, and like count updates.      |
| F3       | Confirm register, login, logout, auth persistence, edit profile save, and protected profile editing work. |
| Everyone | Run the full walkthrough once and log every bug.                                                          |

### May 6 @ 2pm - bug fix cutoff

| Person   | Remainder of work                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------ |
| B1       | Fix backend bugs from the first walkthrough.                                                           |
| B2       | Fix review/like/search/filter bugs from the first walkthrough.                                         |
| F1       | Fix browse layout, loading state, empty state, and card responsiveness.                                |
| F2       | Fix profile detail, review UI, like UI, no-skills state, no-reviews state, and own-profile edge cases. |
| F3       | Fix auth/edit-profile bugs and make all forms visually consistent.                                     |
| Everyone | Make sure every page works without console errors during the demo path.                                |

### May 6 @ 11pm - presentation ready

| Person       | Remainder of work                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| B1 + B2      | Freeze the shared database with clean demo data.                                                      |
| F1 + F2 + F3 | Freeze visual polish unless a bug blocks the demo.                                                    |
| Everyone     | Finish slides: problem, solution, tech stack, team split, live demo plan, and what each person built. |
| Everyone     | Rehearse the demo out loud from a fresh browser session.                                              |

### May 7 @ 6pm - final code freeze

| Person   | Remainder of work                              |
| -------- | ---------------------------------------------- |
| Everyone | Each person has 3+ commits.                    |
| Everyone | Final code pushed.                             |
| Everyone | Final full-flow test passes.                   |
| Everyone | GitHub repo link and slideshow link are ready. |

### May 7 @ 11:59pm - submit

- Submit the repo link and slideshow.
- Do not make last-minute feature changes after submission prep unless the demo
  is broken.

---

## Person-by-Person Remaining Work

## B1 - Backend 1

- Make auth errors use proper HTTP status codes.
- Add default user fields on register: bio, avatar_url, location, contact,
  created_at, updated_at.
- Complete browse users with search/filter/pagination.
- Add DELETE `/api/users/me`.
- Complete Mongo indexes.
- Write and run seed script.
- Swagger-test all B1 endpoints with real data.

## B2 - Backend 2

- Confirm duplicate reviews are blocked by a real unique index.
- Confirm duplicate likes are blocked by a real unique index.
- Confirm self-review and self-like are blocked in Swagger.
- Confirm review edit/delete works using the logged-in user's token.
- Pair with B1 on search/filter because B2 owns the query logic in the plan,
  but the code currently lives in `users_router.py`.

## F1 - Frontend 1

- Fix undefined `navigate` in SkillCard.
- Restore skill badge rendering on cards.
- Make card click route to `/profile/:id`.
- Make filters trigger a fresh fetch.
- Match BrowsePage to the backend pagination response.
- Polish browse grid, empty state, and mobile layout.

## F2 - Frontend 2

- Add real `/profile/:id` routing in `App.jsx`.
- Replace mock profile and review data with backend data.
- Wire ReviewForm to create/update reviews.
- Add delete-review behavior.
- Wire LikeButton to backend status/toggle endpoints.
- Handle own profile, no reviews, no skills, and logged-out user states.

## F3 - Frontend 3

- Fix LoginPage by adding `useAuth()` and `useNavigate()`.
- Make login store the token/user and redirect correctly.
- Replace EditProfilePage mock initial data with current-user data.
- Make Save profile call `apiUpdateProfile`.
- Normalize wanted skills to the backend shape `{ name, category }`.
- Confirm logout/auth persistence works through browser refresh.
- Make form errors user-friendly and consistent.

---

## Final Remaining Checklist

- [ ] Backend `.env` is present locally and not committed.
- [ ] Backend starts cleanly.
- [ ] Swagger loads at `http://localhost:8000/docs`.
- [ ] Seed script creates 10-15 demo users.
- [ ] Browse endpoint supports search/filter/pagination.
- [ ] Register creates a real account.
- [ ] Login works without runtime errors.
- [ ] Edit profile saves to MongoDB.
- [ ] Browse page shows seeded users.
- [ ] Card click opens a real profile detail page.
- [ ] Like button updates the backend and UI.
- [ ] Review form creates/edits/deletes a real review.
- [ ] User cannot like or review their own profile.
- [ ] Duplicate review is blocked.
- [ ] Every planned page loads without console errors.
- [ ] Full demo flow passes from a fresh browser session.
- [ ] Slides are finished.
- [ ] Everyone has 3+ commits.
- [ ] Final code is pushed before May 7 @ 6pm.
- [ ] Submit before May 7 @ 11:59pm.
