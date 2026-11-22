from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Margdarshak" in data["service"]

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["loaded_careers_count"] >= 5
    assert "interest" in data["weights"]

def test_post_recommendations():
    payload = {
        "user_id": "test-user-api-123",
        "language": "te",
        "profile": {
            "current_education_level": "10th_standard",
            "state": "Telangana",
            "district": "Warangal"
        },
        "interests": [
            {"code": "electrical", "name": "Electrical & Renewable Energy"}
        ],
        "skills": [
            {"name": "Electrical Wiring", "proficiency_level": "intermediate"}
        ],
        "preferences": {
            "preferred_work_environment": "field_practical",
            "willingness_to_relocate": "within_state"
        }
    }

    response = client.post("/api/v1/recommendations?limit=3", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "test-user-api-123"
    assert len(data["recommendations"]) <= 3
    assert data["recommendations"][0]["match_score"] > 60.0
    assert "disclaimer" in data

def test_post_skill_gap():
    payload = {
        "career_slug": "solar-technician",
        "student_skills": [
            {"name": "Electrical Wiring", "proficiency_level": "intermediate"}
        ],
        "language": "en"
    }

    response = client.post("/api/v1/skill-gap", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["career_name"] == "Solar PV Technician"
    assert len(data["existing_skills"]) >= 1
    assert len(data["missing_skills"]) >= 1
    assert "readiness_percentage" in data

def test_skill_gap_not_found():
    payload = {
        "career_slug": "non-existent-career-xyz",
        "student_skills": []
    }
    response = client.post("/api/v1/skill-gap", json=payload)
    assert response.status_code == 404

def test_post_recommendations_with_filter_ineligible():
    payload = {
        "user_id": "test-filter-user",
        "profile": {"current_education_level": "10th_standard"}
    }
    # With filter_ineligible=true, only 10th eligible careers return
    res_filtered = client.post("/api/v1/recommendations?limit=5&filter_ineligible=true", json=payload)
    assert res_filtered.status_code == 200
    data_filtered = res_filtered.json()
    for rec in data_filtered["recommendations"]:
        assert rec["education_eligibility"]["is_eligible"] is True

    # With filter_ineligible=false, careers are returned with ineligible penalized
    res_unfiltered = client.post("/api/v1/recommendations?limit=10&filter_ineligible=false", json=payload)
    assert res_unfiltered.status_code == 200
    data_unfiltered = res_unfiltered.json()
    assert any(rec["education_eligibility"]["is_eligible"] is False for rec in data_unfiltered["recommendations"])

def test_skill_gap_by_career_id():
    # Use solar-technician ID
    payload = {
        "career_id": "a1000000-0000-0000-0000-000000000001",
        "student_skills": [
            {"name": "Electrical Wiring", "proficiency_level": "intermediate"}
        ],
        "language": "hi"
    }
    response = client.post("/api/v1/skill-gap", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["career_id"] == "a1000000-0000-0000-0000-000000000001"
    assert len(data["existing_skills"]) >= 1
    assert len(data["missing_skills"]) >= 1
    assert len(data["recommendations"]) > 0
