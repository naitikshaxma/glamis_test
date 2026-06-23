from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.config.settings import get_settings
from app.services.readiness_service import ReadinessService


def test_readiness_service_no_history():
    """Verify scoring behavior when a candidate has no completed interviews."""
    service = ReadinessService(get_settings())
    response = service.calculate_readiness("mock_no_history")
    
    assert response.user_id == "mock_no_history"
    assert response.candidate_name == "No History Candidate"
    assert response.readiness_score == 0.0
    assert response.technical_score == 0.0
    assert response.communication_score == 0.0
    assert response.category == "At Risk"
    assert response.weak_subjects == []
    assert response.strong_subjects == []
    assert response.total_interviews == 0
    assert response.consistency_score == 0.0
    assert response.trend == "Insufficient Data"


def test_readiness_service_low_readiness():
    """Verify scoring logic for a low-performing candidate."""
    service = ReadinessService(get_settings())
    response = service.calculate_readiness("mock_low")
    
    assert response.user_id == "mock_low"
    assert response.candidate_name == "Low Candidate"
    # Weighted calculation:
    # avg_tech = (2.0 + 3.0) / 2 = 2.5
    # avg_comm = (3.0 + 2.0) / 2 = 2.5
    # overall_scores = [2.5, 2.5] -> variance = 0 -> std_dev = 0 -> consistency_score = 10.0
    # completion_score = 2/3 * 10 = 6.6667
    # readiness_score = (2.5 * 0.40) + (2.5 * 0.25) + (10.0 * 0.20) + (6.6667 * 0.15)
    #                 = 1.0 + 0.625 + 2.0 + 1.0
    #                 = 4.625 -> Rounded to 4.62
    assert response.readiness_score == 4.63 or response.readiness_score == 4.62
    assert response.category == "Needs Improvement"
    # Weak subjects: DSA (mean 2.5 < 6.0), DBMS (mean 2.5 < 6.0)
    assert "DSA" in response.weak_subjects
    assert "DBMS" in response.weak_subjects
    assert len(response.strong_subjects) == 0
    assert response.total_interviews == 3
    # Two completed sessions -> less than 3 completed -> trend is Insufficient Data
    assert response.trend == "Insufficient Data"


def test_readiness_service_medium_readiness():
    """Verify scoring logic for a medium-performing candidate."""
    service = ReadinessService(get_settings())
    response = service.calculate_readiness("mock_medium")
    
    assert response.user_id == "mock_medium"
    assert response.candidate_name == "Medium Candidate"
    # avg_tech = (5.0 + 6.0 + 5.0) / 3 = 5.333
    # avg_comm = (6.0 + 5.0 + 5.0) / 3 = 5.333
    # overall_scores = [5.5, 5.5, 5.0]
    # mean_overall = 5.333 -> var = ((0.167)**2 + (0.167)**2 + (-0.333)**2) / 3 = 0.0556 -> std_dev = 0.2357
    # consistency_score = 10 - std_dev * 2 = 9.53
    # completion_score = 3/3 * 10 = 10.0
    # readiness = (5.33 * 0.4) + (5.33 * 0.25) + (9.53 * 0.2) + (10 * 0.15) = 2.133 + 1.333 + 1.906 + 1.50 = 6.87
    assert response.readiness_score >= 6.0
    assert response.category == "Good"
    assert len(response.weak_subjects) == 3  # DSA (5.5), OS (5.5), English (5.0) are < 6.0
    assert len(response.strong_subjects) == 0
    assert response.total_interviews == 3
    assert response.trend == "Stable"  # [5.5, 5.5, 5.0] sorted by date. first half vs second half difference is small


def test_readiness_service_high_readiness():
    """Verify scoring logic for a high-performing candidate."""
    service = ReadinessService(get_settings())
    response = service.calculate_readiness("mock_high")
    
    assert response.user_id == "mock_high"
    assert response.candidate_name == "High Candidate"
    assert response.readiness_score >= 7.5
    assert response.category == "Placement Ready"
    assert len(response.weak_subjects) == 0
    assert len(response.strong_subjects) == 3  # DSA (8.0), CN (8.0), Amazon Mock (8.0) are >= 7.5
    assert response.trend == "Stable"


def test_readiness_service_excellent_readiness():
    """Verify scoring logic for an excellent-performing candidate."""
    service = ReadinessService(get_settings())
    response = service.calculate_readiness("mock_excellent")
    
    assert response.user_id == "mock_excellent"
    assert response.candidate_name == "Excellent Candidate"
    assert response.readiness_score >= 9.0
    assert response.category == "Excellent"
    assert len(response.weak_subjects) == 0
    assert len(response.strong_subjects) == 3
    assert response.trend == "Stable"


def test_readiness_service_missing_data():
    """Verify scoring safety when some technical or communication fields are missing (None)."""
    service = ReadinessService(get_settings())
    response = service.calculate_readiness("mock_missing_data")
    
    assert response.user_id == "mock_missing_data"
    assert response.candidate_name == "Missing Data Candidate"
    assert response.total_interviews == 3
    assert response.readiness_score > 0.0


def test_readiness_service_invalid_user():
    """Verify service raises ValueError when querying an invalid candidate."""
    service = ReadinessService(get_settings())
    with pytest.raises(ValueError, match="User not found"):
        service.calculate_readiness("mock_invalid")


# ============================================================================
# API INTEGRATION TESTS (using client fixture)
# ============================================================================


def test_api_get_readiness_success(client: TestClient):
    """Test GET endpoint retrieves metrics successfully for a mock candidate."""
    response = client.get("/api/v1/admin/readiness/by-user-id/mock_high")
    assert response.status_code == 200
    
    data = response.json()
    assert data["userId"] == "mock_high"
    assert data["candidateName"] == "High Candidate"
    assert data["readinessScore"] >= 7.5
    assert data["category"] == "Placement Ready"
    assert "DSA" in data["strongSubjects"]
    assert "CN" in data["strongSubjects"]
    assert data["trend"] == "Stable"


def test_api_get_readiness_invalid_user(client: TestClient):
    """Test GET endpoint returns 404 for an invalid user ID."""
    response = client.get("/api/v1/admin/readiness/by-user-id/mock_invalid")
    assert response.status_code == 404
    assert "User not found" in response.json()["detail"]


def test_api_post_bulk_success(client: TestClient):
    """Test POST bulk endpoint computes metrics for multiple user IDs in one request."""
    payload = {
        "userIds": ["mock_high", "mock_medium", "mock_low", "mock_no_history"]
    }
    response = client.post("/api/v1/admin/readiness/bulk", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 4
    
    # Check mappings
    high_user = next(u for u in data if u["userId"] == "mock_high")
    assert high_user["candidateName"] == "High Candidate"
    assert high_user["category"] == "Placement Ready"

    low_user = next(u for u in data if u["userId"] == "mock_low")
    assert low_user["candidateName"] == "Low Candidate"
    assert low_user["category"] == "Needs Improvement"


def test_api_post_bulk_all_fail(client: TestClient):
    """Test POST bulk endpoint returns 404/errors if all requested user IDs fail."""
    payload = {
        "userIds": ["mock_invalid", "another_invalid"]
    }
    response = client.post("/api/v1/admin/readiness/bulk", json=payload)
    assert response.status_code == 404
    assert "Failed to calculate readiness" in response.json()["detail"]
