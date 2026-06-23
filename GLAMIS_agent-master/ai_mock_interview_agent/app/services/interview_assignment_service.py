from __future__ import annotations

import logging
from typing import Optional

from app.agents.interview_assignment_agent import InterviewAssignmentAgent
from app.config.settings import Settings
from app.schemas.assignment import AssignmentRoadmapResponse
from app.services.openai_service import OpenAIService, OpenAIConfigurationError
from app.services.readiness_service import ReadinessService

logger = logging.getLogger(__name__)


class InterviewAssignmentService:
    """
    Orchestrates the end-to-end interview assignment pipeline:

    1. Fetch / compute readiness metrics via ReadinessService.
    2. Pass the metrics to InterviewAssignmentAgent.
    3. Return the ranked roadmap to the API layer.

    The service is stateless — no assignments are stored here.
    Node.js remains the source of truth for persisted data.
    """

    def __init__(self, settings: Settings):
        self.settings = settings
        self.readiness_service = ReadinessService(settings)

        # Try to initialise OpenAI; fall back gracefully to rule-based mode.
        openai_service: Optional[OpenAIService] = None
        try:
            openai_service = OpenAIService(settings)
        except OpenAIConfigurationError as exc:
            logger.info(
                "OpenAI service unavailable — InterviewAssignmentAgent will use rule-based mode. Reason: %s",
                exc,
            )
        except Exception as exc:
            logger.warning("Unexpected error initialising OpenAI service: %s", exc)

        # memory=None is acceptable for agents that don't need session memory
        self.agent = InterviewAssignmentAgent(
            openai_service=openai_service,
            memory=None,  # type: ignore[arg-type]
        )

    # ------------------------------------------------------------------
    # Single-user roadmap
    # ------------------------------------------------------------------

    def generate_roadmap(
        self,
        user_id: str,
        jd_match_score: Optional[float] = None,
        target_company: Optional[str] = None,
        db_session=None,
    ) -> AssignmentRoadmapResponse:
        """
        Compute readiness for ``user_id`` and return a ranked assignment roadmap.

        Args:
            user_id:        Candidate user ID (MongoDB ObjectId or mock ID).
            jd_match_score: Optional JD match score (0-10).
            target_company: Optional company name for company-specific mocks.
            db_session:     SQLAlchemy session (used when MongoDB is unavailable).

        Returns:
            AssignmentRoadmapResponse

        Raises:
            ValueError: if the user is not found.
        """
        readiness = self.readiness_service.calculate_readiness(user_id, db_session=db_session)
        return self.agent.generate_roadmap(
            readiness=readiness,
            jd_match_score=jd_match_score,
            target_company=target_company,
        )

    # ------------------------------------------------------------------
    # Bulk roadmaps
    # ------------------------------------------------------------------

    def generate_bulk_roadmaps(
        self,
        user_ids: list[str],
        jd_match_score: Optional[float] = None,
        target_company: Optional[str] = None,
        db_session=None,
    ) -> tuple[list[AssignmentRoadmapResponse], list[str]]:
        """
        Generate roadmaps for multiple candidates.

        Returns:
            A tuple of (successful_roadmaps, error_messages).
        """
        results: list[AssignmentRoadmapResponse] = []
        errors: list[str] = []

        for uid in user_ids:
            try:
                roadmap = self.generate_roadmap(
                    uid,
                    jd_match_score=jd_match_score,
                    target_company=target_company,
                    db_session=db_session,
                )
                results.append(roadmap)
            except ValueError as exc:
                errors.append(f"User {uid}: {exc}")
                logger.warning("User not found during bulk assignment: %s — %s", uid, exc)
            except Exception as exc:
                errors.append(f"User {uid}: unexpected error ({exc})")
                logger.exception("Unexpected error generating roadmap for user %s", uid)

        return results, errors
