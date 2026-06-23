from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.settings import get_settings
from app.database.session import get_db
from app.schemas.readiness import ReadinessRequest, ReadinessResponse
from app.services.readiness_service import ReadinessService

readiness_router = APIRouter(prefix="/admin/readiness", tags=["readiness"])


def get_readiness_service() -> ReadinessService:
    """Dependency injection helper for ReadinessService."""
    return ReadinessService(get_settings())


@readiness_router.get(
    "/by-user-id/{user_id}",
    response_model=ReadinessResponse,
    summary="Get candidate readiness evaluation score",
)
def get_readiness_by_user_id(
    user_id: str,
    db: Session = Depends(get_db),
    service: ReadinessService = Depends(get_readiness_service),
) -> ReadinessResponse:
    """Evaluate interview performance stats and compile readiness metrics for a user ID."""
    try:
        print(f"[READINESS_AGENT_EXECUTED] for user: {user_id}")
        return service.calculate_readiness(user_id, db_session=db)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc)
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while computing readiness: {exc}"
        ) from exc


@readiness_router.post(
    "/bulk",
    response_model=list[ReadinessResponse],
    summary="Batch calculate readiness metrics",
)
def calculate_readiness_bulk(
    payload: ReadinessRequest,
    db: Session = Depends(get_db),
    service: ReadinessService = Depends(get_readiness_service),
) -> list[ReadinessResponse]:
    """Calculate and return readiness metrics for a list of candidate user IDs in bulk."""
    results = []
    errors = []
    
    for uid in payload.user_ids:
        try:
            res = service.calculate_readiness(uid, db_session=db)
            results.append(res)
        except ValueError as exc:
            errors.append(f"User {uid}: {exc}")
        except Exception as exc:
            errors.append(f"User {uid}: failed computation ({exc})")

    if not results and errors:
        # If all requests failed, raise a 404/400
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Failed to calculate readiness for any supplied users. Errors: {'; '.join(errors)}"
        )

    return results
