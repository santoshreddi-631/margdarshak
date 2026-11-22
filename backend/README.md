# Margdarshak Main Backend API (Node.js + Express + TypeScript)

REST API backend for the **AI-Powered Multilingual Career Guidance System** (*Margdarshak*), connecting rural and semi-urban students to career pathways, skill assessments, roadmaps, and government skilling opportunities.

---

## 1. Architecture & Directory Structure

```
backend/
├── src/
│   ├── config/             # Environment validation (Zod) & Supabase client factories
│   ├── controllers/        # Request handlers with typed payloads
│   ├── middleware/         # Supabase Bearer Auth & centralized error handling
│   ├── routes/             # REST route declarations under /api/v1
│   ├── services/           # Business logic, Supabase queries, and Reco Service client
│   ├── types/              # Domain entities, DTOs & Express request extensions
│   ├── utils/              # AppError hierarchy, structured logger & standard JSON envelopes
│   ├── validators/         # Zod input validation schemas
│   ├── app.ts              # Express application setup, Helmet security & CORS policy
│   ├── server.ts           # Server bootstrap & graceful shutdown hooks
│   └── testRunner.ts       # Automated integration test suite
├── .env.example            # Environment variables template
├── package.json
└── tsconfig.json
```

---

## 2. Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure credentials in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   RECOMMENDATION_SERVICE_URL=http://localhost:8000
   ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19006,exp://localhost:8081,http://localhost:3000
   ```

> **Note on Local Development**: When Supabase credentials are not configured, the backend automatically operates with safe offline mock fallbacks for all public catalogs and accepts `X-Dev-User-Id` headers for local prototyping.

---

## 3. Database Migrations & Seeding

Migrations are located in `../supabase/migrations/`:

1. **Schema Migration**: `20261121000001_create_schema.sql`
   - Creates 19 tables with UUID primary keys, foreign key constraints, indexes, and strict Row Level Security (RLS) policies.
   - User ownership policies enforce `auth.uid() = user_id`.
   - Public catalogs (`careers`, `skills`, `opportunities`, `roadmaps`) are read-accessible to authenticated and anonymous users.
2. **Seed Data Migration**: `20261121000002_seed_data.sql`
   - Seeds master taxonomies for career categories, skills, and interests.
   - Seeds career pathways with complete English, Telugu (`te`), and Hindi (`hi`) translations.
   - Seeds learning roadmaps, actionable steps, PMKVY/NAPS schemes, and certified learning resources.

### Running Migrations:
- **Via Supabase Dashboard**: Open the **SQL Editor**, paste the contents of `20261121000001_create_schema.sql`, run it, then run `20261121000002_seed_data.sql`.
- **Via Supabase CLI**:
  ```bash
  supabase db reset
  # Or apply migration directly
  supabase migration up
  ```

---

## 4. Running the Backend

```bash
# Install dependencies
npm install

# Type-check TypeScript
npm run typecheck

# Run automated integration tests
npx tsx src/testRunner.ts

# Start in development mode (hot reload)
npm run dev

# Build and start in production
npm run build
npm start
```

---

## 5. REST API Reference (`/api/v1`)

### Health & Discovery
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/` | No | API Welcome, version and service links |
| `GET` | `/api/v1/health` | No | System health, uptime & service connections |

### Student Profile & Skills
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/v1/profile` | **Bearer Token** | Get student profile, declared skills, and interests |
| `PUT` | `/api/v1/profile` | **Bearer Token** | Upsert student profile details |
| `POST` | `/api/v1/profile/skills` | **Bearer Token** | Batch set student skills and proficiency levels |
| `POST` | `/api/v1/profile/interests` | **Bearer Token** | Batch set student interests |
| `GET` | `/api/v1/profile/skills/master` | No | Get master taxonomy of all available skills |
| `GET` | `/api/v1/profile/interests/master` | No | Get master taxonomy of career interests |

### Career Catalog (Multilingual: `?lang=en|te|hi`)
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/v1/careers/categories` | No | List career categories with localized names |
| `GET` | `/api/v1/careers` | No | Filtered & paginated careers (`?lang=te&search=...`) |
| `GET` | `/api/v1/careers/:id` | No | Full career details, skills required & learning resources |

### Assessment
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/v1/assessments/questions` | No | Localized question bank (`?lang=te&section=interests`) |
| `POST` | `/api/v1/assessments/responses` | **Bearer Token** | Submit or update student responses |
| `GET` | `/api/v1/assessments/responses` | **Bearer Token** | Get current student's submitted responses |

### Roadmaps & Progress Tracking
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/v1/roadmaps/career/:careerId` | Optional | Localized multi-stage roadmap and user progress |
| `POST` | `/api/v1/roadmaps/progress` | **Bearer Token** | Update progress status on a roadmap step |
| `GET` | `/api/v1/roadmaps/progress` | **Bearer Token** | Get all roadmap progress entries for user |

### Opportunities & Government Schemes
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/v1/opportunities` | No | List active schemes (`?category=skilling&lang=te`) |
| `GET` | `/api/v1/opportunities/:id` | No | Details for specific scheme or apprenticeship |

### Career Recommendations
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/v1/recommendations` | **Bearer Token** | Retrieve personalized recommendations (`?lang=te`) |
| `POST` | `/api/v1/recommendations/generate`| **Bearer Token** | Trigger fresh recommendation calculation |

### Saved Careers (Bookmarks)
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/v1/saved-careers` | **Bearer Token** | List student's bookmarked careers |
| `POST` | `/api/v1/saved-careers` | **Bearer Token** | Bookmark a career (`{ career_id }`) |
| `DELETE`| `/api/v1/saved-careers/:careerId` | **Bearer Token** | Remove career from bookmarks |
