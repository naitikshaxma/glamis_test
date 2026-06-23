from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.settings import get_settings
from app.database.session import get_db
from app.schemas.assignment import (
    AssignmentRequest,
    AssignmentRoadmapResponse,
    BulkAssignmentRequest,
)
from app.services.interview_assignment_service import InterviewAssignmentService

assignment_router = APIRouter(prefix="/admin/assignment", tags=["assignment"])


def get_assignment_service() -> InterviewAssignmentService:
    """Dependency injection helper for InterviewAssignmentService."""
    return InterviewAssignmentService(get_settings())


@assignment_router.get(
    "/roadmap/{user_id}",
    response_model=AssignmentRoadmapResponse,
    summary="Generate interview assignment roadmap for a candidate",
)
def get_assignment_roadmap(
    user_id: str,
    jd_match_score: float | None = None,
    target_company: str | None = None,
    db: Session = Depends(get_db),
    service: InterviewAssignmentService = Depends(get_assignment_service),
) -> AssignmentRoadmapResponse:
    """
    Analyze a candidate's readiness profile and return a ranked interview assignment roadmap.

    - **user_id**: MongoDB ObjectId or mock ID (e.g. `mock_medium`)
    - **jd_match_score**: Optional JD match score 0-10
    - **target_company**: Optional company name (e.g. `Google`)
    """
    try:
        return service.generate_roadmap(
            user_id=user_id,
            jd_match_score=jd_match_score,
            target_company=target_company,
            db_session=db,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate assignment roadmap: {exc}",
        ) from exc


@assignment_router.post(
    "/roadmap",
    response_model=AssignmentRoadmapResponse,
    summary="Generate interview assignment roadmap (POST body)",
)
def post_assignment_roadmap(
    payload: AssignmentRequest,
    db: Session = Depends(get_db),
    service: InterviewAssignmentService = Depends(get_assignment_service),
) -> AssignmentRoadmapResponse:
    """
    Same as GET /roadmap/{user_id} but accepts a JSON body.
    Useful when JD match score or company name needs to be passed securely.
    """
    try:
        return service.generate_roadmap(
            user_id=payload.user_id,
            jd_match_score=payload.jd_match_score,
            target_company=payload.target_company,
            db_session=db,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate assignment roadmap: {exc}",
        ) from exc


@assignment_router.post(
    "/bulk",
    response_model=list[AssignmentRoadmapResponse],
    summary="Generate roadmaps for multiple candidates in bulk",
)
def bulk_assignment_roadmap(
    payload: BulkAssignmentRequest,
    db: Session = Depends(get_db),
    service: InterviewAssignmentService = Depends(get_assignment_service),
) -> list[AssignmentRoadmapResponse]:
    """
    Generate ranked interview assignment roadmaps for a batch of candidates.
    Partial successes are returned — errors for individual users are logged but do not
    fail the entire request unless all users fail.
    """
    results, errors = service.generate_bulk_roadmaps(
        user_ids=payload.user_ids,
        jd_match_score=payload.jd_match_score,
        target_company=payload.target_company,
        db_session=db,
    )

    if not results and errors:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Failed to generate roadmaps for all users. Errors: {'; '.join(errors)}",
        )

    return results
