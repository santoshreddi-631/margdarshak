import sys
from fastapi.testclient import TestClient
from app.main import app

def run_smoke_test():
    print("=== Margdarshak Recommendation Service Smoke Test ===")
    client = TestClient(app)

    # 1. Health check
    res_health = client.get("/api/v1/health")
    assert res_health.status_code == 200, f"Health check failed: {res_health.status_code}"
    print("[PASS] Health Check:", res_health.json())

    # 2. Recommendations test with rural student profile (10th pass, interest in solar & trades)
    student_payload = {
        "user_id": "student-warangal-001",
        "language": "te",
        "profile": {
            "current_education_level": "10th_standard",
            "state": "Telangana",
            "district": "Warangal Rural"
        },
        "interests": [
            {"code": "electrical", "name": "Electrical & Solar Power"},
            {"code": "practical_trades", "name": "Hands-on Technical Repairs"}
        ],
        "skills": [
            {"name": "Electrical Wiring", "proficiency_level": "intermediate"}
        ],
        "preferences": {
            "preferred_work_environment": "field_practical",
            "willingness_to_relocate": "within_district"
        }
    }

    res_reco = client.post("/api/v1/recommendations?limit=3", json=student_payload)
    assert res_reco.status_code == 200, f"Recommendation failed: {res_reco.status_code}"
    reco_data = res_reco.json()
    print(f"[PASS] Generated {len(reco_data['recommendations'])} recommendations for user: {reco_data['user_id']}")
    for i, r in enumerate(reco_data["recommendations"], 1):
        print(f"  {i}. {r['title']} (Score: {r['match_score']}%)")
        print(f"     Reasons: {r['reasons']}")
        print(f"     Breakdown: {r['score_breakdown']}")

    # 3. Skill gap analysis for Solar PV Technician
    gap_payload = {
        "career_slug": "solar-technician",
        "student_skills": [
            {"name": "Electrical Wiring", "proficiency_level": "beginner"}
        ],
        "language": "te"
    }

    res_gap = client.post("/api/v1/skill-gap", json=gap_payload)
    assert res_gap.status_code == 200, f"Skill gap failed: {res_gap.status_code}"
    gap_data = res_gap.json()
    print(f"[PASS] Skill Gap Analysis for '{gap_data['career_name']}':")
    print(f"  Readiness: {gap_data['readiness_percentage']}%")
    print(f"  Skills to Improve ({len(gap_data['skills_to_improve'])}): {[s['name'] for s in gap_data['skills_to_improve']]}")
    print(f"  Missing Skills ({len(gap_data['missing_skills'])}): {[s['name'] for s in gap_data['missing_skills']]}")
    print(f"  Guidance: {gap_data['recommendations']}")

    print("=== All Smoke Tests Passed Successfully ===")

if __name__ == "__main__":
    run_smoke_test()
