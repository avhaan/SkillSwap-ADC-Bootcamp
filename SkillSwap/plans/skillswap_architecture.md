# SkillSwap — Full Project Architecture
> App Dev Bootcamp Hackathon Spring 2026 | Deadline: May 7, 11:59pm | Team: 5 people

---

## 1. What Is This

**SkillSwap** is a web app where anyone can list skills they offer and skills they're looking for, browse other users like a marketplace, and arrange skill-for-skill trades directly (no money, no platform-mediated matching). Think Facebook Marketplace, but for swapping what you know instead of selling what you own.

**The core loop:**
1. Sign up → add your skills (offered + wanted) + contact info
2. Browse the marketplace → filter by skill category, search by keyword
3. Click a profile → see their skills, proficiency, description, reviews, and likes
4. Contact them directly (email or phone shown on profile)
5. After a swap, come back and leave a review

---

## 2. Feature List (MVP — everything needed to demo)

### Auth
- Register with name, email, password
- Login / logout
- JWT-based sessions (stored in localStorage)
- No email verification needed (fully open signup)

### User Profile
- Display name, bio, avatar (URL or initials fallback)
- Contact info: email and/or phone (user chooses what to show)
- Location (city or campus — plain text, not GPS)
- List of **skills offered** (each with: skill name, category, proficiency level, short description)
- List of **skills wanted** (each with: skill name, category)
- Total likes received
- All reviews received

### Browse / Marketplace
- Card grid of user profiles (like FB Marketplace)
- Each card shows: avatar, name, location, top 2–3 offered skills with proficiency badges, like count
- Search bar — full-text search across skill names and descriptions
- Filter by category (dropdown or tag pills)
- Filter by proficiency level
- Pagination or infinite scroll (pagination is easier — do that)

### Profile Detail Page
- Full profile view
- All offered skills with proficiency + description
- All wanted skills
- Contact info (email/phone)
- Like button (toggle — one like per user per profile)
- Reviews section — list of existing reviews + leave a review form (any logged-in user)
- Review form: star rating (1–5) + text comment

### Skills System
- Predefined category list (user picks from dropdown, not free text — keeps data clean)
- Proficiency levels: Beginner / Intermediate / Advanced / Expert
- User can add up to ~8 offered skills and ~8 wanted skills (prevents bloat)

### Reviews & Likes
- Any logged-in user can like any profile (not their own)
- Any logged-in user can leave a review on any profile (not their own)
- One review per reviewer per profile (can edit their own review)
- Reviews show: reviewer name, star rating, comment, date

---

## 3. Skill Categories (predefined list)

```
Technology & Programming
Design & Creative
Music & Arts
Language & Writing
Cooking & Food
Fitness & Sports
Academic Tutoring
Trades & DIY
Business & Finance
Photography & Video
Other
```

---

## 4. Data Models (MongoDB Collections)

### users
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique, indexed)",
  "password_hash": "string",
  "bio": "string (optional)",
  "avatar_url": "string (optional)",
  "location": "string (optional, e.g. 'College Park, MD')",
  "contact": {
    "show_email": "boolean",
    "phone": "string (optional)",
    "show_phone": "boolean"
  },
  "skills_offered": [
    {
      "skill_id": "ObjectId",
      "name": "string",
      "category": "string (from predefined list)",
      "proficiency": "Beginner | Intermediate | Advanced | Expert",
      "description": "string (max 200 chars)"
    }
  ],
  "skills_wanted": [
    {
      "name": "string",
      "category": "string"
    }
  ],
  "like_count": "integer (denormalized for fast reads)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### reviews
```json
{
  "_id": "ObjectId",
  "reviewer_id": "ObjectId (ref: users)",
  "reviewer_name": "string (denormalized for display)",
  "target_user_id": "ObjectId (ref: users, indexed)",
  "rating": "integer 1–5",
  "comment": "string (max 500 chars)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```
*Compound unique index on `(reviewer_id, target_user_id)` — enforces one review per pair.*

### likes
```json
{
  "_id": "ObjectId",
  "liker_id": "ObjectId (ref: users)",
  "target_user_id": "ObjectId (ref: users)",
  "created_at": "datetime"
}
```
*Compound unique index on `(liker_id, target_user_id)` — enforces one like per pair.*

---

## 5. API Endpoints (FastAPI)

### Auth — `/api/auth`
| Method | Path | Description | Auth required |
|--------|------|-------------|---------------|
| POST | `/register` | Create account | No |
| POST | `/login` | Returns JWT | No |
| GET | `/me` | Get current user's full profile | Yes |

### Users — `/api/users`
| Method | Path | Description | Auth required |
|--------|------|-------------|---------------|
| GET | `/` | Browse users — supports `?search=`, `?category=`, `?proficiency=`, `?page=`, `?limit=` | No |
| GET | `/{user_id}` | Get full profile of one user | No |
| PUT | `/me` | Update own profile (bio, contact, location, skills) | Yes |
| DELETE | `/me` | Delete own account | Yes |

### Reviews — `/api/reviews`
| Method | Path | Description | Auth required |
|--------|------|-------------|---------------|
| GET | `/{user_id}` | Get all reviews for a user | No |
| POST | `/{user_id}` | Leave a review on a profile | Yes |
| PUT | `/{user_id}` | Edit your own review on a profile | Yes |
| DELETE | `/{user_id}` | Delete your own review | Yes |

### Likes — `/api/likes`
| Method | Path | Description | Auth required |
|--------|------|-------------|---------------|
| POST | `/{user_id}` | Toggle like on a profile (like if not liked, unlike if liked) | Yes |
| GET | `/{user_id}/status` | Check if current user has liked this profile | Yes |

### Categories — `/api/categories`
| Method | Path | Description | Auth required |
|--------|------|-------------|---------------|
| GET | `/` | Returns the predefined category list | No |

---

## 6. Frontend Pages & Components

### Pages (React Router)
```
/                   → Landing page (hero + call to action)
/browse             → Marketplace grid (main page)
/profile/:id        → User profile detail
/profile/me/edit    → Edit own profile
/register           → Sign up form
/login              → Login form
```

### Key Components
```
Navbar              → Logo, search bar shortcut, login/logout, profile link
SkillCard           → Used in browse grid — avatar, name, location, skill badges, like count
SkillBadge          → Pill showing skill name + proficiency color-coded
ProfileHeader       → Avatar, name, location, contact info, like button
SkillList           → Rendered list of offered or wanted skills
ReviewCard          → Single review — reviewer name, stars, comment, date
ReviewForm          → Star picker + textarea + submit
SearchBar           → Controlled input that updates browse query params
FilterPanel         → Category dropdown + proficiency filter
Pagination          → Prev/next with page count
```

---

## 7. Team Split & Ownership

| Person | Role | Owns |
|--------|------|------|
| Person 1 | Backend lead | Auth (register/login/JWT), users CRUD, MongoDB setup, project structure |
| Person 2 | Backend | Reviews + likes endpoints, search/filter query logic, pagination |
| Person 3 | Frontend lead | App structure, routing, Navbar, Browse page, SkillCard, SearchBar, FilterPanel |
| Person 4 | Frontend | Profile detail page, ProfileHeader, SkillList, ReviewCard, ReviewForm |
| Person 5 | Frontend + integration | Register/Login forms, Edit profile page, wiring all API calls, final CSS polish |

**Every person should have 3+ commits by demo day.** The backend people can seed the DB and write tests. The frontend-heavy person (Person 5) handles all the `fetch()` calls to the API so the other two frontend devs can focus purely on components and layout.

---

## 8. Build Timeline

**Today → April 30 (Week 1): Foundation**
- [ ] Repo setup, folder structure agreed, README skeleton
- [ ] MongoDB Atlas cluster created, connection string shared
- [ ] FastAPI project skeleton with CORS configured
- [ ] React app created (`create-react-app` or Vite), React Router installed
- [ ] Auth endpoints done and tested (Person 1)
- [ ] User model + GET /users + GET /users/:id done (Person 1)
- [ ] Browse page skeleton rendering mock data (Person 3)
- [ ] Register + Login pages functional (Person 5)

**May 1–3 (Week 2): Core features**
- [ ] PUT /me — edit profile working (Person 1)
- [ ] Reviews endpoints done (Person 2)
- [ ] Likes toggle endpoint done (Person 2)
- [ ] Search + filter query logic in GET /users (Person 2)
- [ ] Browse page wired to real API with search + filters (Person 3 + 5)
- [ ] Profile detail page fully built (Person 4)
- [ ] Edit profile page working end-to-end (Person 5)
- [ ] ReviewForm wired and posting reviews (Person 4 + 5)

**May 4–6: Polish & demo prep**
- [ ] CSS polish — consistent spacing, colors, responsive layout
- [ ] Seed DB with 10–15 fake users covering all categories
- [ ] Full walkthrough: register → edit profile → browse → view profile → leave review → like
- [ ] Fix any broken flows
- [ ] Prepare slides: problem → solution → demo

**May 7 by 11:59pm: Submit**
- [ ] Code pushed, everyone has 3+ commits
- [ ] Slideshow link submitted

---

## 9. Tech Stack Summary

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend | React + CSS | No Tailwind needed, plain CSS modules or one global stylesheet |
| Routing | React Router v6 | `BrowserRouter`, `useParams`, `useNavigate` |
| API calls | Native `fetch` | No Axios needed, keep it simple |
| Auth state | React Context + localStorage | Store JWT token, decode for user ID |
| Backend | FastAPI (Python) | Pydantic models for all request/response validation |
| Auth | JWT via `python-jose` | `passlib` for password hashing |
| Database | MongoDB Atlas (free tier) | `motor` (async MongoDB driver for FastAPI) |
| CORS | FastAPI CORSMiddleware | Allow localhost:3000 in dev |

---

## 10. Key Implementation Notes

**JWT flow:** On login, backend returns a token. Frontend stores it in localStorage. Every protected request sends `Authorization: Bearer <token>` header. Backend decodes and extracts `user_id` from the token — no session table needed.

**Search implementation:** MongoDB `$text` index on `skills_offered.name`, `skills_offered.description`, and `name` fields. For category and proficiency filtering, use `$elemMatch` on the `skills_offered` array. Keep it simple — no Elasticsearch.

**Like count denormalization:** Store `like_count` directly on the user document and increment/decrement it when a like is toggled. This avoids a COUNT query on the likes collection every time a card renders in the browse view.

**Pagination:** Use `skip` + `limit` in MongoDB queries. Default: 12 cards per page. Pass `?page=1&limit=12` in query params.

**One review per user per profile:** Enforced by the compound unique index on `(reviewer_id, target_user_id)` in MongoDB, and also checked in the API before inserting.

**No file uploads:** Avatar is a URL string. Users can paste an image URL or leave it blank (show initials as fallback in the UI). Saves you from dealing with cloud storage.

**CORS in dev:** FastAPI CORSMiddleware should allow `http://localhost:3000` (React dev server). In production (if you deploy), update to your actual domain.

---

## 11. What's Intentionally Left Out (scope cuts)

These were considered and deliberately excluded to keep the project shippable:

- ❌ In-app messaging — too complex, out of scope
- ❌ Email verification — no SMTP setup needed
- ❌ Notifications — no WebSockets or polling
- ❌ Image uploads — URL string only
- ❌ Swap request / confirmation flow — browse and contact directly
- ❌ Admin panel — not needed for hackathon
- ❌ Rate limiting — not needed for demo
- ❌ Password reset — not needed for hackathon scope

---

## 12. Demo Script (for presentation day)

1. Open the landing page — explain the problem in one sentence
2. Register a new account live (takes 20 seconds)
3. Fill in a profile: add 3 offered skills with different proficiency levels, 2 wanted skills, contact info
4. Go to Browse — show the grid, search for "guitar", filter by category
5. Click into a seeded profile — show their skills, contact info
6. Leave a review with a star rating
7. Like the profile — show the count increment
8. Go back to Browse — show the filter working by category
9. Close: "Anyone can find someone to swap with in under a minute"

**Have 10–15 seeded accounts ready before the demo. Do not demo on an empty database.**

---

*Last updated: April 28, 2026*
