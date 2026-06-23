from __future__ import annotations

import logging
from typing import Any, Optional

from pydantic import BaseModel, Field

from app.agents.base import BaseInterviewAgent
from app.schemas.assignment import (
    AssignmentRoadmapResponse,
    InterviewRecommendation,
)
from app.schemas.readiness import ReadinessResponse

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Internal LLM response model (used only inside this agent)
# ---------------------------------------------------------------------------

class _LLMRecommendation(BaseModel):
    interview_type: str
    priority: str
    rationale: str
    estimated_duration_minutes: int
    prerequisite_met: bool


class _LLMAssignmentOutput(BaseModel):
    recommendations: list[_LLMRecommendation] = Field(default_factory=list)
    agent_summary: str = ""
    placement_eligible: bool = False


# ---------------------------------------------------------------------------
# Duration lookup
# ---------------------------------------------------------------------------

_DURATION_MAP: dict[str, int] = {
    "DSA Interview": 45,
    "DBMS Interview": 40,
    "OS Interview": 40,
    "CN Interview": 40,
    "Verbal Interview": 30,
    "HR Interview": 45,
    "Placement Drive": 90,
    "Written Test": 60,
    "Company Mock": 60,
}

_VALID_TYPES = set(_DURATION_MAP.keys())

_PRIORITY_ORDER = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}


# ---------------------------------------------------------------------------
# Agent
# ---------------------------------------------------------------------------

class InterviewAssignmentAgent(BaseInterviewAgent):
    """
    Analyzes a student's readiness profile and produces a prioritized
    interview assignment roadmap.

    Two execution modes:
    - LLM mode  : when ``openai_service`` is available — sends profile to GPT
                  and parses structured JSON output.
    - Rule mode : deterministic fallback based on score thresholds, used when
                  no LLM key is configured or the LLM call fails.
    """

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def generate_roadmap(
        self,
        readiness: ReadinessResponse,
        jd_match_score: Optional[float] = None,
        target_company: Optional[str] = None,
    ) -> AssignmentRoadmapResponse:
        """
        Generate a personalized interview assignment roadmap for a student.

        Args:
            readiness:      Computed ReadinessResponse from the Readiness Engine.
            jd_match_score: Optional JD match score (0-10).
            target_company: Optional company name for targeted mock interviews.

        Returns:
            AssignmentRoadmapResponse with ordered recommendations and summary.
        """
        if self.has_llm:
            try:
                return self._generate_with_llm(readiness, jd_match_score, target_company)
            except Exception as exc:
                logger.warning(
                    "LLM-based assignment generation failed (%s). Falling back to rule engine.",
                    exc,
                )

        return self._generate_with_rules(readiness, jd_match_score, target_company)

    # ------------------------------------------------------------------
    # LLM path
    # ------------------------------------------------------------------

    def _generate_with_llm(
        self,
        readiness: ReadinessResponse,
        jd_match_score: Optional[float],
        target_company: Optional[str],
    ) -> AssignmentRoadmapResponse:
        """Invoke OpenAI with the assignment prompt and parse the result."""
        variables: dict[str, Any] = {
            "candidate_name": readiness.candidate_name,
            "readiness_score": readiness.readiness_score,
            "readiness_category": readiness.category,
            "technical_score": readiness.technical_score,
            "communication_score": readiness.communication_score,
            "consistency_score": readiness.consistency_score,
            "trend": readiness.trend,
            "weak_subjects": ", ".join(readiness.weak_subjects) if readiness.weak_subjects else "None",
            "strong_subjects": ", ".join(readiness.strong_subjects) if readiness.strong_subjects else "None",
            "total_interviews": readiness.total_interviews,
            "jd_match_score": str(round(jd_match_score, 2)) if jd_match_score is not None else "Not provided",
            "target_company": target_company or "Not specified",
        }

        llm_output: _LLMAssignmentOutput = self.openai_service.generate_structured(
            "interview_assignment_agent.txt",
            variables,
            _LLMAssignmentOutput,
        )

        recommendations = self._validate_and_sort_recommendations(
            llm_output.recommendations, readiness
        )

        return AssignmentRoadmapResponse(
            user_id=readiness.user_id,
            candidate_name=readiness.candidate_name,
            readiness_score=readiness.readiness_score,
            readiness_category=readiness.category,
            technical_score=readiness.technical_score,
            communication_score=readiness.communication_score,
            consistency_score=readiness.consistency_score,
            trend=readiness.trend,
            weak_subjects=readiness.weak_subjects,
            strong_subjects=readiness.strong_subjects,
            total_interviews_done=readiness.total_interviews,
            recommendations=recommendations,
            agent_summary=llm_output.agent_summary or self._build_summary(readiness, recommendations),
            placement_eligible=llm_output.placement_eligible,
            jd_match_score=jd_match_score,
            generated_by="InterviewAssignmentAgent[LLM]",
        )

    # ------------------------------------------------------------------
    # Rule-based fallback path
    # ------------------------------------------------------------------

    def _generate_with_rules(
        self,
        readiness: ReadinessResponse,
        jd_match_score: Optional[float],
        target_company: Optional[str],
    ) -> AssignmentRoadmapResponse:
        """Deterministic rule engine — no LLM dependency required."""
        recommendations: list[InterviewRecommendation] = []
        already_added: set[str] = set()

        def add(
            itype: str,
            priority: str,
            rationale: str,
        ) -> None:
            if itype in already_added:
                return
            already_added.add(itype)
            prereq = (
                readiness.readiness_score >= 5.0
                if itype in {"Placement Drive", "Company Mock", "HR Interview"}
                else True
            )
            recommendations.append(
                InterviewRecommendation(
                    interview_type=itype,  # type: ignore[arg-type]
                    priority=priority,  # type: ignore[arg-type]
                    rationale=rationale,
                    estimated_duration_minutes=_DURATION_MAP[itype],
                    prerequisite_met=prereq,
                )
            )

        # ── Subject-based weak area remediation ──────────────────────
        subject_map = {
            "DSA": "DSA Interview",
            "DBMS": "DBMS Interview",
            "OS": "OS Interview",
            "CN": "CN Interview",
        }
        for weak in readiness.weak_subjects:
            for keyword, interview in subject_map.items():
                if keyword.lower() in weak.lower():
                    add(interview, "Critical", f"{weak} is flagged as a weak subject — immediate remediation required.")

        # ── Communication remediation ─────────────────────────────────
        if readiness.communication_score < 6.0:
            add("Verbal Interview", "Critical",
                f"Communication score of {readiness.communication_score}/10 is critically low; verbal coaching is urgent.")
        elif readiness.communication_score < 7.5:
            add("Verbal Interview", "High",
                f"Communication score of {readiness.communication_score}/10 needs improvement before placement rounds.")

        # ── Baseline assessment for new students ─────────────────────
        if readiness.total_interviews < 3:
            add("Written Test", "Medium",
                "Fewer than 3 interviews completed — a written aptitude baseline test is recommended.")

        # ── Subject interviews for non-weak, non-strong areas ────────
        covered_subjects = {s.lower() for s in readiness.strong_subjects}
        for keyword, interview in subject_map.items():
            if keyword.lower() not in covered_subjects and interview not in already_added:
                add(interview, "Medium",
                    f"{keyword} has not been covered in recent sessions; recommended for comprehensive preparation.")

        # ── HR interview for ready candidates ─────────────────────────
        if readiness.readiness_score >= 7.5:
            add("HR Interview", "Medium",
                f"Readiness score of {readiness.readiness_score}/10 qualifies for behavioural/HR round preparation.")

        # ── Company mock from JD match ─────────────────────────────────
        if jd_match_score is not None and jd_match_score >= 7.0:
            label = f"for {target_company}" if target_company else ""
            add("Company Mock", "High",
                f"JD match score of {jd_match_score}/10 is strong; a company-specific mock interview {label} is recommended.")

        # ── Placement Drive for top performers ───────────────────────
        if readiness.readiness_score >= 8.5:
            add("Placement Drive", "High",
                f"Readiness score of {readiness.readiness_score}/10 qualifies for a full Placement Drive.")

        # Clamp to max 6 recommendations, sort by priority
        recommendations = self._sort_by_priority(recommendations)[:6]

        # Ensure at least 2 entries
        if len(recommendations) < 2 and "Written Test" not in already_added:
            add("Written Test", "Low",
                "Additional practice through a written aptitude test is always beneficial.")
            recommendations = self._sort_by_priority(recommendations)

        # Second safety: still need one more
        if len(recommendations) < 2 and "HR Interview" not in already_added:
            add("HR Interview", "Low",
                "Behavioural and HR round practice is always valuable for any candidate seeking placement.")
            recommendations = self._sort_by_priority(recommendations)

        # Placement eligibility
        placement_eligible = (
            readiness.readiness_score >= 7.5
            and readiness.technical_score >= 7.0
            and readiness.communication_score >= 6.5
            and readiness.trend in {"Improving", "Stable"}
        )

        return AssignmentRoadmapResponse(
            user_id=readiness.user_id,
            candidate_name=readiness.candidate_name,
            readiness_score=readiness.readiness_score,
            readiness_category=readiness.category,
            technical_score=readiness.technical_score,
            communication_score=readiness.communication_score,
            consistency_score=readiness.consistency_score,
            trend=readiness.trend,
            weak_subjects=readiness.weak_subjects,
            strong_subjects=readiness.strong_subjects,
            total_interviews_done=readiness.total_interviews,
            recommendations=recommendations,
            agent_summary=self._build_summary(readiness, recommendations),
            placement_eligible=placement_eligible,
            jd_match_score=jd_match_score,
            generated_by="InterviewAssignmentAgent[Rules]",
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _validate_and_sort_recommendations(
        self,
        raw: list[_LLMRecommendation],
        readiness: ReadinessResponse,
    ) -> list[InterviewRecommendation]:
        """Coerce, validate, and sort LLM recommendations."""
        valid: list[InterviewRecommendation] = []
        seen: set[str] = set()

        for r in raw:
            itype = r.interview_type.strip()
            priority = r.priority.strip().capitalize()

            # Normalise type
            if itype not in _VALID_TYPES:
                # attempt fuzzy match
                for vt in _VALID_TYPES:
                    if itype.lower() in vt.lower() or vt.lower() in itype.lower():
                        itype = vt
                        break
                else:
                    logger.debug("Skipping unknown interview type from LLM: %s", itype)
                    continue

            if priority not in _PRIORITY_ORDER:
                priority = "Medium"

            if itype in seen:
                continue
            seen.add(itype)

            prereq = (
                readiness.readiness_score >= 5.0
                if itype in {"Placement Drive", "Company Mock", "HR Interview"}
                else True
            )

            valid.append(
                InterviewRecommendation(
                    interview_type=itype,  # type: ignore[arg-type]
                    priority=priority,  # type: ignore[arg-type]
                    rationale=r.rationale,
                    estimated_duration_minutes=_DURATION_MAP.get(itype, 45),
                    prerequisite_met=prereq,
                )
            )

        return self._sort_by_priority(valid)[:6]

    @staticmethod
    def _sort_by_priority(recs: list[InterviewRecommendation]) -> list[InterviewRecommendation]:
        return sorted(recs, key=lambda r: _PRIORITY_ORDER.get(r.priority, 99))

    @staticmethod
    def _build_summary(
        readiness: ReadinessResponse,
        recommendations: list[InterviewRecommendation],
    ) -> str:
        top = recommendations[0].interview_type if recommendations else "further practice"
        weak_str = ", ".join(readiness.weak_subjects) if readiness.weak_subjects else "none identified"
        return (
            f"{readiness.candidate_name} is currently rated '{readiness.category}' with a readiness "
            f"score of {readiness.readiness_score}/10 and a trend of '{readiness.trend}'. "
            f"Weak areas include: {weak_str}. "
            f"The most urgent next step is a '{top}'. "
            f"{len(recommendations)} interview(s) have been recommended to maximize placement readiness."
        )
