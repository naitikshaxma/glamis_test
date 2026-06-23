"""
Tests for the Interview Assignment Agent — Phase 2.

Coverage:
  - Rule-engine correctness for all readiness categories
  - Weak-subject → Critical recommendation mapping
  - Communication score → Verbal Interview priority mapping
  - Placement eligibility logic
  - Bulk generation (partial failures)
  - API endpoints: GET /roadmap/{user_id}, POST /roadmap, POST /bulk
  - LLM fallback behaviour (no OpenAI key)
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.agents.interview_assignment_agent import InterviewAssignmentAgent
from app.schemas.readiness import ReadinessResponse
from app.services.interview_assignment_service import InterviewAssignmentService


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

def _make_readiness(**overrides) -> ReadinessResponse:
    """Return a ReadinessResponse with sensible defaults, overrideable per test."""
    defaults = dict(
        user_id="test_user",
        candidate_name="Test Candidate",
        readiness_score=6.5,
        technical_score=6.5,
        communication_score=7.0,
        category="Good",
        weak_subjects=[],
        strong_subjects=[],
        total_interviews=3,
        consistency_score=8.0,
        trend="Stable",
    )
    defaults.update(overrides)
    return ReadinessResponse(**defaults)


@pytest.fixture()
def rule_agent():
    """Agent with no LLM — always uses rule-based generation."""
    return InterviewAssignmentAgent(openai_service=None, memory=None)


@pytest.fixture()
def client():
    """FastAPI test client."""
    from app.main import app
    return TestClient(app)


# ---------------------------------------------------------------------------
# Unit: Rule engine
# ---------------------------------------------------------------------------

class TestRuleEngine:

    def test_at_risk_student_gets_critical_verbal(self, rule_agent):
        """At-risk student with low comm score must get Verbal Interview as Critical."""
        readiness = _make_readiness(
            readiness_score=2.5,
            technical_score=2.0,
            communication_score=3.5,
            category="At Risk",
            weak_subjects=["DSA", "DBMS"],
            total_interviews=1,
        )
        roadmap = rule_agent.generate_roadmap(readiness)

        types = [r.interview_type for r in roadmap.recommendations]
        priorities = {r.interview_type: r.priority for r in roadmap.recommendations}

        assert "Verbal Interview" in types
        assert priorities["Verbal Interview"] == "Critical"

    def test_weak_dsa_maps_to_critical(self, rule_agent):
        """DSA in weak_subjects must produce a DSA Interview with Critical priority."""
        readiness = _make_readiness(weak_subjects=["DSA"], communication_score=7.0)
        roadmap = rule_agent.generate_roadmap(readiness)

        priorities = {r.interview_type: r.priority for r in roadmap.recommendations}
        assert "DSA Interview" in priorities
        assert priorities["DSA Interview"] == "Critical"

    def test_weak_dbms_maps_to_critical(self, rule_agent):
        readiness = _make_readiness(weak_subjects=["DBMS"])
        roadmap = rule_agent.generate_roadmap(readiness)
        priorities = {r.interview_type: r.priority for r in roadmap.recommendations}
        assert priorities.get("DBMS Interview") == "Critical"

    def test_weak_os_maps_to_critical(self, rule_agent):
        readiness = _make_readiness(weak_subjects=["OS"])
        roadmap = rule_agent.generate_roadmap(readiness)
        priorities = {r.interview_type: r.priority for r in roadmap.recommendations}
        assert priorities.get("OS Interview") == "Critical"

    def test_weak_cn_maps_to_critical(self, rule_agent):
        readiness = _make_readiness(weak_subjects=["CN"])
        roadmap = rule_agent.generate_roadmap(readiness)
        priorities = {r.interview_type: r.priority for r in roadmap.recommendations}
        assert priorities.get("CN Interview") == "Critical"

    def test_communication_between_6_and_75_is_high_verbal(self, rule_agent):
        readiness = _make_readiness(communication_score=6.8)
        roadmap = rule_agent.generate_roadmap(readiness)
        priorities = {r.interview_type: r.priority for r in roadmap.recommendations}
        assert priorities.get("Verbal Interview") == "High"

    def test_high_readiness_includes_hr_interview(self, rule_agent):
        readiness = _make_readiness(
            readiness_score=8.0,
            technical_score=8.0,
            communication_score=7.8,
            category="Placement Ready",
        )
        roadmap = rule_agent.generate_roadmap(readiness)
        types = [r.interview_type for r in roadmap.recommendations]
        assert "HR Interview" in types

    def test_excellent_readiness_includes_placement_drive(self, rule_agent):
        readiness = _make_readiness(
            readiness_score=9.0,
            technical_score=9.0,
            communication_score=9.0,
            category="Excellent",
        )
        roadmap = rule_agent.generate_roadmap(readiness)
        types = [r.interview_type for r in roadmap.recommendations]
        assert "Placement Drive" in types

    def test_jd_match_triggers_company_mock(self, rule_agent):
        readiness = _make_readiness(readiness_score=7.5, technical_score=7.5)
        roadmap = rule_agent.generate_roadmap(readiness, jd_match_score=8.0, target_company="Google")
        types = [r.interview_type for r in roadmap.recommendations]
        assert "Company Mock" in types

    def test_jd_match_below_threshold_no_company_mock(self, rule_agent):
        readiness = _make_readiness()
        roadmap = rule_agent.generate_roadmap(readiness, jd_match_score=5.0)
        types = [r.interview_type for r in roadmap.recommendations]
        assert "Company Mock" not in types

    def test_new_student_gets_written_test(self, rule_agent):
        readiness = _make_readiness(total_interviews=1)
        roadmap = rule_agent.generate_roadmap(readiness)
        types = [r.interview_type for r in roadmap.recommendations]
        assert "Written Test" in types

    def test_recommendations_capped_at_6(self, rule_agent):
        readiness = _make_readiness(
            weak_subjects=["DSA", "DBMS", "OS", "CN"],
            communication_score=4.0,
            total_interviews=1,
            readiness_score=9.0,
        )
        roadmap = rule_agent.generate_roadmap(readiness)
        assert len(roadmap.recommendations) <= 6

    def test_recommendations_at_least_2(self, rule_agent):
        readiness = _make_readiness(
            readiness_score=7.0,
            technical_score=7.0,
            communication_score=7.5,
            weak_subjects=[],
            strong_subjects=["DSA", "DBMS", "OS", "CN"],
            total_interviews=5,
        )
        roadmap = rule_agent.generate_roadmap(readiness)
        assert len(roadmap.recommendations) >= 2

    def test_no_duplicate_recommendations(self, rule_agent):
        readiness = _make_readiness(weak_subjects=["DSA", "DSA"])
        roadmap = rule_agent.generate_roadmap(readiness)
        types = [r.interview_type for r in roadmap.recommendations]
        assert len(types) == len(set(types))

    def test_recommendations_sorted_by_priority(self, rule_agent):
        order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
        readiness = _make_readiness(
            weak_subjects=["DSA"],
            communication_score=5.5,
            readiness_score=8.0,
        )
        roadmap = rule_agent.generate_roadmap(readiness)
        priorities = [order[r.priority] for r in roadmap.recommendations]
        assert priorities == sorted(priorities)


# ---------------------------------------------------------------------------
# Unit: Placement eligibility
# ---------------------------------------------------------------------------

class TestPlacementEligibility:

    def test_eligible_when_all_criteria_met(self, rule_agent):
        readiness = _make_readiness(
            readiness_score=8.0,
            technical_score=7.5,
            communication_score=7.0,
            trend="Stable",
        )
        roadmap = rule_agent.generate_roadmap(readiness)
        assert roadmap.placement_eligible is True

    def test_not_eligible_low_readiness(self, rule_agent):
        readiness = _make_readiness(readiness_score=5.0, technical_score=7.0, communication_score=7.0)
        roadmap = rule_agent.generate_roadmap(readiness)
        assert roadmap.placement_eligible is False

    def test_not_eligible_declining_trend(self, rule_agent):
        readiness = _make_readiness(
            readiness_score=8.0, technical_score=7.5, communication_score=7.0, trend="Declining"
        )
        roadmap = rule_agent.generate_roadmap(readiness)
        assert roadmap.placement_eligible is False

    def test_not_eligible_low_communication(self, rule_agent):
        readiness = _make_readiness(
            readiness_score=8.0, technical_score=7.5, communication_score=5.0, trend="Stable"
        )
        roadmap = rule_agent.generate_roadmap(readiness)
        assert roadmap.placement_eligible is False


# ---------------------------------------------------------------------------
# Unit: Agent summary
# ---------------------------------------------------------------------------

class TestAgentSummary:

    def test_summary_is_non_empty(self, rule_agent):
        readiness = _make_readiness()
        roadmap = rule_agent.generate_roadmap(readiness)
        assert isinstance(roadmap.agent_summary, str)
        assert len(roadmap.agent_summary) > 20

    def test_summary_contains_candidate_name(self, rule_agent):
        readiness = _make_readiness(candidate_name="Ravi Sharma")
        roadmap = rule_agent.generate_roadmap(readiness)
        assert "Ravi Sharma" in roadmap.agent_summary


# ---------------------------------------------------------------------------
# Integration: Service layer
# ---------------------------------------------------------------------------

class TestAssignmentService:

    def test_service_generates_roadmap_for_mock_high(self):
        from app.config.settings import get_settings
        service = InterviewAssignmentService(get_settings())
        roadmap = service.generate_roadmap("mock_high")
        assert roadmap.user_id == "mock_high"
        assert roadmap.readiness_score > 0
        assert len(roadmap.recommendations) >= 2

    def test_service_raises_value_error_for_unknown_user(self):
        from app.config.settings import get_settings
        service = InterviewAssignmentService(get_settings())
        with pytest.raises(ValueError, match="User not found"):
            service.generate_roadmap("nonexistent_xyz_user")

    def test_bulk_partial_success(self):
        from app.config.settings import get_settings
        service = InterviewAssignmentService(get_settings())
        results, errors = service.generate_bulk_roadmaps(["mock_medium", "bad_user_xyz"])
        assert len(results) == 1
        assert len(errors) == 1
        assert results[0].user_id == "mock_medium"

    def test_bulk_all_valid(self):
        from app.config.settings import get_settings
        service = InterviewAssignmentService(get_settings())
        results, errors = service.generate_bulk_roadmaps(["mock_low", "mock_high"])
        assert len(results) == 2
        assert errors == []

    def test_service_with_jd_match_score(self):
        from app.config.settings import get_settings
        service = InterviewAssignmentService(get_settings())
        roadmap = service.generate_roadmap("mock_high", jd_match_score=8.5, target_company="Amazon")
        types = [r.interview_type for r in roadmap.recommendations]
        assert "Company Mock" in types


# ---------------------------------------------------------------------------
# Integration: API endpoints
# ---------------------------------------------------------------------------

class TestAssignmentAPI:

    def test_get_roadmap_mock_medium(self, client):
        res = client.get("/api/v1/admin/assignment/roadmap/mock_medium")
        assert res.status_code == 200
        body = res.json()
        assert body["userId"] == "mock_medium"
        assert isinstance(body["recommendations"], list)
        assert len(body["recommendations"]) >= 2

    def test_get_roadmap_unknown_user_404(self, client):
        res = client.get("/api/v1/admin/assignment/roadmap/nonexistent_user_abc")
        assert res.status_code == 404

    def test_post_roadmap_body(self, client):
        res = client.post(
            "/api/v1/admin/assignment/roadmap",
            json={"userId": "mock_low"},
        )
        assert res.status_code == 200
        body = res.json()
        assert body["userId"] == "mock_low"
        assert body["readinessCategory"] in {
            "At Risk", "Needs Improvement", "Good", "Placement Ready", "Excellent"
        }

    def test_post_roadmap_with_jd(self, client):
        res = client.post(
            "/api/v1/admin/assignment/roadmap",
            json={"userId": "mock_high", "jdMatchScore": 8.5, "targetCompany": "Google"},
        )
        assert res.status_code == 200
        body = res.json()
        assert body["jdMatchScore"] == 8.5

    def test_bulk_roadmap_success(self, client):
        res = client.post(
            "/api/v1/admin/assignment/bulk",
            json={"userIds": ["mock_medium", "mock_high"]},
        )
        assert res.status_code == 200
        body = res.json()
        assert len(body) == 2

    def test_bulk_roadmap_partial_failure(self, client):
        res = client.post(
            "/api/v1/admin/assignment/bulk",
            json={"userIds": ["mock_excellent", "nonexistent_user_xyz"]},
        )
        # Partial success returns 200 with 1 result
        assert res.status_code == 200
        body = res.json()
        assert len(body) == 1
        assert body[0]["userId"] == "mock_excellent"

    def test_bulk_all_fail_returns_404(self, client):
        res = client.post(
            "/api/v1/admin/assignment/bulk",
            json={"userIds": ["bad_user_1", "bad_user_2"]},
        )
        assert res.status_code == 404

    def test_response_schema_fields_present(self, client):
        res = client.get("/api/v1/admin/assignment/roadmap/mock_high")
        assert res.status_code == 200
        body = res.json()
        required_fields = [
            "userId", "candidateName", "readinessScore", "readinessCategory",
            "technicalScore", "communicationScore", "consistencyScore", "trend",
            "weakSubjects", "strongSubjects", "totalInterviewsDone",
            "recommendations", "agentSummary", "placementEligible", "generatedBy",
        ]
        for field in required_fields:
            assert field in body, f"Missing field: {field}"

    def test_recommendation_schema_fields_present(self, client):
        res = client.get("/api/v1/admin/assignment/roadmap/mock_medium")
        assert res.status_code == 200
        body = res.json()
        rec = body["recommendations"][0]
        for field in ["interviewType", "priority", "rationale", "estimatedDurationMinutes", "prerequisiteMet"]:
            assert field in rec, f"Missing recommendation field: {field}"

    def test_get_roadmap_with_query_params(self, client):
        res = client.get(
            "/api/v1/admin/assignment/roadmap/mock_high",
            params={"jd_match_score": 7.5, "target_company": "Microsoft"},
        )
        assert res.status_code == 200
        body = res.json()
        assert body["jdMatchScore"] == 7.5
