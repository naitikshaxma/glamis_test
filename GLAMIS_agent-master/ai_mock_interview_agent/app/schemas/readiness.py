from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


def to_camel(string: str) -> str:
    parts = string.split("_")
    return parts[0] + "".join(word.title() for word in parts[1:])


class ReadinessRequest(BaseModel):
    """Request schema for calculating readiness in bulk."""
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    user_ids: list[str] = Field(..., description="List of user IDs to calculate readiness for")


class ReadinessResponse(BaseModel):
    """Response schema containing computed readiness metrics for a user."""
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    
    user_id: str = Field(..., description="The unique user identifier")
    candidate_name: str = Field(..., description="Name of the candidate")
    readiness_score: float = Field(..., description="Unified readiness score out of 10")
    technical_score: float = Field(..., description="Average technical performance score out of 10")
    communication_score: float = Field(..., description="Average communication score out of 10")
    category: str = Field(..., description="Candidate category (At Risk, Needs Improvement, Good, Placement Ready, Excellent)")
    weak_subjects: list[str] = Field(default_factory=list, description="List of subjects with average scores < 6.0")
    strong_subjects: list[str] = Field(default_factory=list, description="List of subjects with average scores >= 7.5")
    total_interviews: int = Field(..., description="Total interviews attempted")
    consistency_score: float = Field(..., description="Consistency metric score out of 10")
    trend: str = Field(..., description="Candidate trend (Improving, Declining, Stable, Insufficient Data)")
