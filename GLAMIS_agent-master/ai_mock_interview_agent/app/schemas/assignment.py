from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


def to_camel(string: str) -> str:
    parts = string.split("_")
    return parts[0] + "".join(word.title() for word in parts[1:])


# ---------------------------------------------------------------------------
# Request
# ---------------------------------------------------------------------------

class AssignmentRequest(BaseModel):
    """Request schema for generating an interview assignment roadmap."""
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    user_id: str = Field(..., description="The unique user identifier")
    jd_match_score: Optional[float] = Field(
        None,
        ge=0.0,
        le=10.0,
        description="Optional JD match score (0-10) used when a job description is available",
    )
    target_company: Optional[str] = Field(
        None,
        description="Optional target company name for company-specific recommendations",
    )


class BulkAssignmentRequest(BaseModel):
    """Request schema for bulk interview assignment roadmap generation."""
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    user_ids: list[str] = Field(..., description="List of user IDs to generate roadmaps for")
    jd_match_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    target_company: Optional[str] = Field(None)


# ---------------------------------------------------------------------------
# Interview Recommendation Item
# ---------------------------------------------------------------------------

InterviewCategory = Literal[
    "DSA Interview",
    "DBMS Interview",
    "OS Interview",
    "CN Interview",
    "Verbal Interview",
    "HR Interview",
    "Placement Drive",
    "Written Test",
    "Company Mock",
]

PriorityLevel = Literal["Critical", "High", "Medium", "Low"]


class InterviewRecommendation(BaseModel):
    """A single interview recommendation with rationale and priority."""
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    interview_type: InterviewCategory = Field(..., description="Interview type to assign")
    priority: PriorityLevel = Field(..., description="Priority level of this assignment")
    rationale: str = Field(..., description="Short reasoning for this recommendation")
    estimated_duration_minutes: int = Field(
        ..., description="Estimated interview duration in minutes"
    )
    prerequisite_met: bool = Field(
        ...,
        description="Whether the student meets minimum prerequisites for this interview",
    )


# ---------------------------------------------------------------------------
# Response
# ---------------------------------------------------------------------------

class AssignmentRoadmapResponse(BaseModel):
    """Full assignment roadmap response for a single candidate."""
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    user_id: str = Field(..., description="The unique user identifier")
    candidate_name: str = Field(..., description="Name of the candidate")
    readiness_score: float = Field(..., description="Unified readiness score out of 10")
    readiness_category: str = Field(..., description="Readiness category label")
    technical_score: float = Field(..., description="Average technical performance score out of 10")
    communication_score: float = Field(..., description="Average communication score out of 10")
    consistency_score: float = Field(..., description="Consistency metric score out of 10")
    trend: str = Field(..., description="Candidate trend (Improving, Declining, Stable, Insufficient Data)")
    weak_subjects: list[str] = Field(default_factory=list, description="Subjects flagged as weak")
    strong_subjects: list[str] = Field(default_factory=list, description="Subjects flagged as strong")
    total_interviews_done: int = Field(..., description="Total interviews already completed")
    recommendations: list[InterviewRecommendation] = Field(
        default_factory=list,
        description="Ordered list of recommended interview assignments",
    )
    agent_summary: str = Field(..., description="Human-readable summary from the Assignment Agent")
    placement_eligible: bool = Field(
        ..., description="Whether the candidate is eligible for a Placement Drive"
    )
    jd_match_score: Optional[float] = Field(
        None, description="JD match score used in this evaluation, if provided"
    )
    generated_by: str = Field(default="InterviewAssignmentAgent", description="Agent identifier")
