# Margdarshak Career Recommendation Service (FastAPI)

A dedicated Python service providing weighted multi-criteria career recommendations, educational eligibility verification, and actionable skill gap analysis for the **AI-Powered Multilingual Career Guidance System (*Margdarshak*)**.

---

## 1. Architecture & Folder Structure

```
recommendation-service/
├── app/
│   ├── api/
│   │   └── routes/
│   │       ├── health.py            # Service health and weights endpoint
│   │       ├── recommendations.py   # Recommendation generation endpoint
│   │       └── skill_gap.py         # Skill gap breakdown endpoint
│   ├── core/
│   │   └── config.py                # Environment and algorithm weights config
│   ├── data/
│   │   └── careers.json             # Structured multilingual career catalog
│   ├── schemas/
│   │   ├── career.py                # Catalog item and eligibility models
│   │   ├── recommendation.py        # Recommendation request/response schemas
│   │   ├── skill_gap.py             # Skill gap request/response schemas
│   │   └── student.py               # Student profile, skills & preferences
│   ├── services/
│   │   ├── eligibility.py           # Stage 2: Educational eligibility filtering
│   │   ├── interest_matching.py     # Stage 3: Jaccard interest overlap scoring
│   │   ├── skill_matching.py        # Stage 3: Weighted skill scoring with proficiency
│   │   ├── skill_gap.py             # Stage 5: Skill gap prioritization & advice
│   │   └── recommendation_engine.py # Stage 4: Orchestrator, ranking & rationale
│   └── main.py                      # FastAPI app entrypoint
├── tests/
│   ├── test_api.py                  # API routes integration tests
│   ├── test_eligibility.py          # Eligibility rules unit tests
│   ├── test_interest_matching.py    # Interest scoring unit tests
│   ├── test_recommendation_engine.py# End-to-end engine tests
│   ├── test_skill_gap.py            # Gap analysis unit tests
│   └── test_skill_matching.py       # Skill scoring unit tests
├── .env.example
├── requirements.txt
├── smoke_test.py
└── README.md
```

---

## 2. Multi-Stage Recommendation Engine

### Stage 1: Structured Career Catalog
- Stored in `app/data/careers.json`.
- Each record includes minimum education level, stream restrictions, required vs. recommended skills with importance weights, relevant interest tags, work environment tags, certified learning resources, step pathways, and full English, Telugu (`te`), and Hindi (`hi`) translations.
- Includes `sample_data_verification` audit metadata (e.g. NSDC Qualification Pack, PMKVY 4.0 curriculum references).

### Stage 2: Eligibility Filtering
- Filters out careers that fail mandatory requirements.
- Distinguishes mandatory rules from preferred qualifications:
  - If a student has `10th_standard` and the career requires `12th_standard` or `bachelors`, the student is filtered out or marked ineligible.
  - If a student meets or exceeds the mandatory qualification, they proceed to scoring.
  - Strict stream requirements (e.g., Science for Medical Laboratory Technician) are strictly enforced.

### Stage 3: Weighted Multi-Factor Matching Algorithm
All components are normalized from **0 to 100**:

$$\text{Match Score} = (0.40 \times \text{Interest}) + (0.30 \times \text{Skill}) + (0.20 \times \text{Education}) + (0.10 \times \text{Preference})$$

Weights are configurable via environment variables (`WEIGHT_INTEREST`, `WEIGHT_SKILL`, `WEIGHT_EDUCATION`, `WEIGHT_PREFERENCE`):
- **Interest Match (0–100)**: Tokenized semantic overlap between declared student interests and career tags.
- **Skill Match (0–100)**: Required skills carry double weight (`2.0x`) over recommended skills (`1.0x`), with proficiency multipliers: `advanced` (1.0), `intermediate` (0.85), `beginner` (0.60).
- **Education Match (0–100)**: Exact fit (95–100), exceeding fit (85–90), with stream bonus (+10).
- **Preference Match (0–100)**: Alignment of work environment (`field_practical`, `office_desk`, `hybrid`), relocation willingness (`within_district`, `within_state`, `anywhere_in_india`), and learning style.

### Stage 4: Ranking & Explanation Generation
- Careers are ranked by composite match score in descending order.
- Generates clear, student-friendly explanation reasons (e.g., *"Directly matches your interest in Electrical"*, *"Leverages your existing skills in Electrical Wiring"*).
- Attaches alternative career options as stepping stones.
- Delivers a clear ethical disclaimer that match scores reflect profile suitability, not guaranteed employment.

### Stage 5: Skill Gap Analysis
- Classifies target career skills into:
  - `acquired`: Student has verified intermediate or advanced competency.
  - `needs_improvement`: Student has beginner skill requiring structured advancement.
  - `missing`: Skill absent from student profile.
- Assigns actionable priorities:
  - Required missing skills $\rightarrow$ `critical` priority.
  - Recommended missing skills $\rightarrow$ `high` priority.
- Computes overall `readiness_percentage` and provides tailored learning resource links.

---

## 3. API Reference

### 1. `GET /api/v1/health`
**Response:**
```json
{
  "status": "healthy",
  "service": "Margdarshak Career Recommendation Service",
  "version": "1.0.0",
  "environment": "development",
  "loaded_careers_count": 8,
  "weights": {
    "interest": 0.4,
    "skill": 0.3,
    "education": 0.2,
    "preference": 0.1
  }
}
```

### 2. `POST /api/v1/recommendations?limit=5`
**Request Body:**
```json
{
  "user_id": "student-warangal-001",
  "language": "te",
  "profile": {
    "current_education_level": "10th_standard",
    "state": "Telangana",
    "district": "Warangal Rural"
  },
  "interests": [
    {"code": "electrical", "name": "Electrical & Solar Power"},
    {"code": "practical_trades", "name": "Hands-on Technical Work"}
  ],
  "skills": [
    {"name": "Electrical Wiring", "proficiency_level": "intermediate"}
  ],
  "preferences": {
    "preferred_work_environment": "field_practical",
    "willingness_to_relocate": "within_district"
  }
}
```

**Response:**
```json
{
  "user_id": "student-warangal-001",
  "total_evaluated_careers": 8,
  "weights_used": {
    "interest": 0.4,
    "skill": 0.3,
    "education": 0.2,
    "preference": 0.1
  },
  "disclaimer": "Match scores represent programmatic suitability and alignment with student declarations, not guaranteed employment probabilities or job guarantees.",
  "recommendations": [
    {
      "career_id": "c0000000-0000-0000-0000-000000000001",
      "slug": "solar-technician",
      "title": "సోలార్ పివి టెక్నీషియన్",
      "category": "trades",
      "match_score": 77.6,
      "score_breakdown": {
        "interest_match": 85.0,
        "skill_match": 50.14,
        "education_match": 95.0,
        "preference_match": 96.0
      },
      "reasons": [
        "Directly matches your interest in Electrical, Practical Trades",
        "Leverages your existing skills: Electrical Wiring (Intermediate)",
        "Fully eligible with your 10Th Standard qualification",
        "High regional hiring demand and active government training schemes"
      ],
      "matching_interests": ["Electrical", "Practical Trades"],
      "matching_skills": ["Electrical Wiring (Intermediate)"],
      "missing_skills": ["Solar Installation", "Workplace Safety & Earthing"],
      "education_eligibility": {
        "is_eligible": true,
        "student_level": "10th_standard",
        "required_level": "10th_standard",
        "is_preferred_stream": true,
        "notes": "Eligible. Meets educational requirement of 10Th Standard. Preferred: ITI in Electrical or Electronic Mechanic trade; Basic familiarity with DC circuits and multimeter reading."
      },
      "alternative_career_options": [
        "Junior Web Developer",
        "Agricultural Drone & Smart Tech Operator"
      ],
      "salary_range": "₹18,000 - ₹32,000 / month",
      "training_duration": "3 - 6 Months",
      "growth_demand": "high",
      "description": "గ్రామీణ మరియు సెమీ-అర్బన్ ప్రాంతాలలో రూఫ్‌టాప్ మరియు వ్యవసాయ సోలార్ పంపులను ఇన్‌స్టాల్ చేయడం మరియు నిర్వహించడం."
    }
  ]
}
```

### 3. `POST /api/v1/skill-gap`
**Request Body:**
```json
{
  "career_slug": "solar-technician",
  "language": "en",
  "student_skills": [
    {"name": "Electrical Wiring", "proficiency_level": "beginner"}
  ]
}
```

**Response:**
```json
{
  "career_id": "c0000000-0000-0000-0000-000000000001",
  "career_name": "Solar PV Technician",
  "readiness_percentage": 10.0,
  "existing_skills": [],
  "skills_to_improve": [
    {
      "name": "Electrical Wiring",
      "status": "needs_improvement",
      "current_proficiency": "Beginner",
      "required_proficiency": "Intermediate",
      "importance": "required",
      "priority": "high",
      "actionable_advice": "Foundational understanding exists. Advance to intermediate competency through hands-on lab practice."
    }
  ],
  "missing_skills": [
    {
      "name": "Solar Installation",
      "status": "missing",
      "current_proficiency": null,
      "required_proficiency": "Intermediate",
      "importance": "required",
      "priority": "critical",
      "actionable_advice": "Mandatory requirement. Must prioritize certified training in Solar Installation via PMKVY or government ITI."
    }
  ],
  "learning_resources": [
    {
      "title": "Suryamitra National Solar Training Curriculum",
      "provider": "National Institute of Solar Energy (NISE)",
      "url": "https://nise.res.in/suryamitra",
      "type": "portal",
      "is_free": true
    }
  ],
  "recommendations": [
    "Bridge 2 critical required skills before applying for full-time positions.",
    "Upgrade 1 existing beginner skills to intermediate level through structured apprenticeships.",
    "Early stage. Complete foundational skilling courses before seeking immediate placement."
  ]
}
```

---

## 4. Running the Service & Tests

```bash
cd recommendation-service

# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the test suite (19 unit/API tests)
pytest

# 3. Run the end-to-end smoke test
python smoke_test.py

# 4. Start the server (port 8000)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
