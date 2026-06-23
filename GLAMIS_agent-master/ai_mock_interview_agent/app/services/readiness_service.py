from __future__ import annotations

import datetime
import logging
from typing import Any
from bson import ObjectId
import pymongo
from sqlalchemy import select
from app.config.settings import Settings
from app.models.interview import Answer, InterviewSession, Question
from app.schemas.readiness import ReadinessResponse

logger = logging.getLogger(__name__)


class ReadinessService:
    """Computes candidate interview readiness scores and diagnostics."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.mongodb_url = settings.mongodb_url
        self.mongo_client = None
        self.mongo_db = None

        if self.mongodb_url:
            try:
                # Parse DB name from URI
                parsed = pymongo.uri_parser.parse_uri(self.mongodb_url)
                db_name = parsed.get("database") or "glamis"
                self.mongo_client = pymongo.MongoClient(self.mongodb_url)
                self.mongo_db = self.mongo_client[db_name]
                logger.info("ReadinessService connected to MongoDB database: %s", db_name)
            except Exception as exc:
                logger.exception("Failed to connect to MongoDB in ReadinessService. Fallback to SQL mode.")

    def fetch_history_from_mongo(self, user_id: str) -> tuple[str, list[dict[str, Any]]]:
        """Fetch student profile and mock interview history from MongoDB."""
        if self.mongo_db is None:
            raise RuntimeError("MongoDB connection is not initialized.")

        try:
            # Resolve user_id to ObjectId if it's a 24-character hex string
            try:
                user_oid = ObjectId(user_id)
            except Exception:
                user_oid = user_id

            # Find user
            user = self.mongo_db["users"].find_one({"_id": user_oid})
            if not user:
                # Try string matching
                user = self.mongo_db["users"].find_one({"_id": str(user_id)})
                if not user:
                    raise ValueError(f"User not found: {user_id}")

            candidate_name = user.get("name", "Unknown Candidate")

            # Find student
            student = self.mongo_db["students"].find_one({"user": user["_id"]})
            if not student:
                student = self.mongo_db["students"].find_one({"user": str(user["_id"])})
                if not student:
                    return candidate_name, []

            interview_ids = student.get("interview_taken", [])
            if not interview_ids:
                return candidate_name, []

            # Convert all reference IDs to ObjectIds/strings
            resolved_ids = []
            for iid in interview_ids:
                if isinstance(iid, ObjectId):
                    resolved_ids.append(iid)
                else:
                    try:
                        resolved_ids.append(ObjectId(iid))
                    except Exception:
                        resolved_ids.append(iid)

            # Fetch interviews
            interviews_cursor = self.mongo_db["interviews"].find({"_id": {"$in": resolved_ids}})
            interviews_map = {str(iv["_id"]): iv for iv in interviews_cursor}

            history = []
            
            # Fetch all questions for these interviews
            questions_cursor = self.mongo_db["interviewquestions"].find({"interview": {"$in": resolved_ids}})
            questions_by_interview: dict[str, list[dict[str, Any]]] = {}
            for q in questions_cursor:
                iv_id = str(q.get("interview"))
                if iv_id not in questions_by_interview:
                    questions_by_interview[iv_id] = []
                questions_by_interview[iv_id].append(q)

            for iv_id, iv in interviews_map.items():
                questions = questions_by_interview.get(iv_id, [])
                
                tech_scores = []
                comm_scores = []
                overall_scores = []
                
                for q in questions:
                    def norm(val):
                        if val is None:
                            return None
                        try:
                            f_val = float(val)
                            # Normalize 0-100 scale to 0-10
                            return f_val / 10.0 if f_val > 10.0 else f_val
                        except ValueError:
                            return None

                    q_overall = norm(q.get("overallPerformance"))
                    q_tech = norm(q.get("technicalSkills"))
                    q_correctness = norm(q.get("correctness"))
                    q_grammar = norm(q.get("grammar"))
                    q_vocabulary = norm(q.get("vocabulary"))
                    q_fluency = norm(q.get("fluency"))
                    q_pronunciation = norm(q.get("pronunciation"))

                    if q_overall is not None:
                        overall_scores.append(q_overall)
                    
                    t_vals = [v for v in [q_tech, q_correctness] if v is not None]
                    if t_vals:
                        tech_scores.append(sum(t_vals) / len(t_vals))
                    elif q_overall is not None:
                        tech_scores.append(q_overall)
                        
                    c_vals = [v for v in [q_grammar, q_vocabulary, q_fluency, q_pronunciation] if v is not None]
                    if c_vals:
                        comm_scores.append(sum(c_vals) / len(c_vals))
                    elif q_overall is not None:
                        comm_scores.append(q_overall)

                avg_tech = sum(tech_scores) / len(tech_scores) if tech_scores else None
                avg_comm = sum(comm_scores) / len(comm_scores) if comm_scores else None
                avg_overall = sum(overall_scores) / len(overall_scores) if overall_scores else None

                history.append({
                    "type": iv.get("type", "subject"),
                    "subject": iv.get("description") or iv.get("title") or "General",
                    "technical_score": avg_tech,
                    "communication_score": avg_comm,
                    "overall_score": avg_overall,
                    "is_completed": not iv.get("is_active", True),
                    "created_at": iv.get("createdAt") or iv.get("updatedAt") or datetime.datetime.now(datetime.timezone.utc)
                })

            return candidate_name, history
        except Exception as exc:
            logger.error("Error fetching history from MongoDB: %s", exc)
            raise

    def fetch_history_from_sqlite(self, user_id: str, db_session) -> tuple[str, list[dict[str, Any]]]:
        """Fetch history from local SQL tables (typically used in SQLite environments)."""
        statement = select(InterviewSession).where(
            (InterviewSession.candidate_name == user_id) | (InterviewSession.id == user_id)
        )
        sessions = db_session.scalars(statement).all()
        if not sessions:
            statement = select(InterviewSession).where(
                InterviewSession.candidate_name.ilike(f"%{user_id}%")
            )
            sessions = db_session.scalars(statement).all()
            if not sessions:
                raise ValueError(f"User not found: {user_id}")

        candidate_name = sessions[0].candidate_name if sessions else user_id
        history = []

        for session in sessions:
            tech_scores = []
            comm_scores = []
            overall_scores = []
            
            for ans in session.answers:
                eval_json = ans.evaluation_json or {}
                
                def get_score(key):
                    val = eval_json.get(key)
                    if val is None:
                        return None
                    try:
                        f_val = float(val)
                        return f_val / 10.0 if f_val > 10.0 else f_val
                    except ValueError:
                        return None

                q_overall = get_score("overall_score")
                q_tech = get_score("technical_score")
                q_comm = get_score("communication_score")

                if q_overall is not None:
                    overall_scores.append(q_overall)
                if q_tech is not None:
                    tech_scores.append(q_tech)
                if q_comm is not None:
                    comm_scores.append(q_comm)

            avg_tech = sum(tech_scores) / len(tech_scores) if tech_scores else None
            avg_comm = sum(comm_scores) / len(comm_scores) if comm_scores else None
            avg_overall = sum(overall_scores) / len(overall_scores) if overall_scores else None

            history.append({
                "type": session.interview_type,
                "subject": session.subject or "General",
                "technical_score": avg_tech,
                "communication_score": avg_comm,
                "overall_score": avg_overall,
                "is_completed": session.status == "completed",
                "created_at": session.created_at
            })

        return candidate_name, history

    def get_mock_history_fallback(self, user_id: str) -> tuple[str, list[dict[str, Any]]]:
        """Provide fallback mock histories for unit testing/offline scenarios."""
        MOCK_HISTORIES = {
            "mock_no_history": ("No History Candidate", []),
            "mock_low": ("Low Candidate", [
                {"type": "subject", "subject": "DSA", "technical_score": 2.0, "communication_score": 3.0, "overall_score": 2.5, "is_completed": True, "created_at": datetime.datetime(2026, 6, 1)},
                {"type": "subject", "subject": "DBMS", "technical_score": 3.0, "communication_score": 2.0, "overall_score": 2.5, "is_completed": True, "created_at": datetime.datetime(2026, 6, 2)},
                {"type": "verbal", "subject": "Communication", "technical_score": 1.0, "communication_score": 3.0, "overall_score": 2.0, "is_completed": False, "created_at": datetime.datetime(2026, 6, 3)},
            ]),
            "mock_medium": ("Medium Candidate", [
                {"type": "subject", "subject": "DSA", "technical_score": 5.0, "communication_score": 6.0, "overall_score": 5.5, "is_completed": True, "created_at": datetime.datetime(2026, 6, 1)},
                {"type": "subject", "subject": "OS", "technical_score": 6.0, "communication_score": 5.0, "overall_score": 5.5, "is_completed": True, "created_at": datetime.datetime(2026, 6, 2)},
                {"type": "written", "subject": "English", "technical_score": 5.0, "communication_score": 5.0, "overall_score": 5.0, "is_completed": True, "created_at": datetime.datetime(2026, 6, 3)},
            ]),
            "mock_high": ("High Candidate", [
                {"type": "subject", "subject": "DSA", "technical_score": 8.0, "communication_score": 8.0, "overall_score": 8.0, "is_completed": True, "created_at": datetime.datetime(2026, 6, 1)},
                {"type": "subject", "subject": "CN", "technical_score": 7.5, "communication_score": 8.5, "overall_score": 8.0, "is_completed": True, "created_at": datetime.datetime(2026, 6, 2)},
                {"type": "company", "subject": "Amazon Mock", "technical_score": 8.2, "communication_score": 7.8, "overall_score": 8.0, "is_completed": True, "created_at": datetime.datetime(2026, 6, 3)},
            ]),
            "mock_excellent": ("Excellent Candidate", [
                {"type": "subject", "subject": "DSA", "technical_score": 9.5, "communication_score": 9.2, "overall_score": 9.4, "is_completed": True, "created_at": datetime.datetime(2026, 6, 1)},
                {"type": "subject", "subject": "DBMS", "technical_score": 9.2, "communication_score": 9.6, "overall_score": 9.4, "is_completed": True, "created_at": datetime.datetime(2026, 6, 2)},
                {"type": "company", "subject": "Google Mock", "technical_score": 9.6, "communication_score": 9.4, "overall_score": 9.5, "is_completed": True, "created_at": datetime.datetime(2026, 6, 3)},
            ]),
            "mock_missing_data": ("Missing Data Candidate", [
                {"type": "subject", "subject": "DSA", "technical_score": None, "communication_score": 5.0, "overall_score": 5.0, "is_completed": True, "created_at": datetime.datetime(2026, 6, 1)},
                {"type": "subject", "subject": "DBMS", "technical_score": 6.0, "communication_score": None, "overall_score": 6.0, "is_completed": True, "created_at": datetime.datetime(2026, 6, 2)},
                {"type": "verbal", "subject": "Verbal", "technical_score": None, "communication_score": None, "overall_score": None, "is_completed": True, "created_at": datetime.datetime(2026, 6, 3)},
            ])
        }

        if user_id in MOCK_HISTORIES:
            return MOCK_HISTORIES[user_id]
        
        raise ValueError(f"User not found: {user_id}")

    def calculate_readiness(self, user_id: str, db_session=None) -> ReadinessResponse:
        """Calculate user readiness score and other metadata diagnostics."""
        candidate_name = "Unknown Candidate"
        history = []

        valid_mock_ids = {
            "mock_no_history",
            "mock_low",
            "mock_medium",
            "mock_high",
            "mock_excellent",
            "mock_missing_data",
        }

        # Guard against unknown mock candidates
        if user_id.startswith("mock_") and user_id not in valid_mock_ids:
            raise ValueError(f"User not found: {user_id}")

        if self.mongo_db is not None:
            try:
                candidate_name, history = self.fetch_history_from_mongo(user_id)
            except ValueError:
                # If user not found in Mongo, attempt fallback lookup
                if user_id in valid_mock_ids:
                    candidate_name, history = self.get_mock_history_fallback(user_id)
                else:
                    raise
        else:
            if db_session:
                try:
                    candidate_name, history = self.fetch_history_from_sqlite(user_id, db_session)
                except ValueError:
                    if user_id in valid_mock_ids:
                        candidate_name, history = self.get_mock_history_fallback(user_id)
                    else:
                        raise
            else:
                candidate_name, history = self.get_mock_history_fallback(user_id)

        return self.compute_readiness_metrics(user_id, candidate_name, history)

    def compute_readiness_metrics(self, user_id: str, candidate_name: str, history: list[dict[str, Any]]) -> ReadinessResponse:
        """Compute the final readiness properties using the weighted scoring logic."""
        total_interviews = len(history)
        completed_interviews = [h for h in history if h.get("is_completed", False)]
        completed_count = len(completed_interviews)

        if not completed_interviews:
            return ReadinessResponse(
                user_id=user_id,
                candidate_name=candidate_name,
                readiness_score=0.0,
                technical_score=0.0,
                communication_score=0.0,
                category="At Risk",
                weak_subjects=[],
                strong_subjects=[],
                total_interviews=total_interviews,
                consistency_score=0.0,
                trend="Insufficient Data"
            )

        # Technical score average
        tech_scores = [h["technical_score"] for h in completed_interviews if h.get("technical_score") is not None]
        avg_tech = sum(tech_scores) / len(tech_scores) if tech_scores else 0.0

        # Communication score average
        comm_scores = [h["communication_score"] for h in completed_interviews if h.get("communication_score") is not None]
        avg_comm = sum(comm_scores) / len(comm_scores) if comm_scores else 0.0

        # Overall scores average
        overall_scores = [h["overall_score"] for h in completed_interviews if h.get("overall_score") is not None]

        # Consistency score (based on standard deviation of overall scores)
        if len(overall_scores) < 2:
            consistency_score = 10.0
        else:
            mean_overall = sum(overall_scores) / len(overall_scores)
            variance = sum((x - mean_overall) ** 2 for x in overall_scores) / len(overall_scores)
            std_dev = variance ** 0.5
            # Deduct std_dev * 2 from 10.0, clamp to [0.0, 10.0]
            consistency_score = max(0.0, 10.0 - (std_dev * 2.0))

        # Interview Completion ratio (mapped to 0-10 scale)
        completion_score = (completed_count / total_interviews) * 10.0 if total_interviews > 0 else 0.0

        # Weighted Readiness Score:
        # Technical = 40%, Communication = 25%, Consistency = 20%, Completion = 15%
        readiness_score = (
            (avg_tech * 0.40) +
            (avg_comm * 0.25) +
            (consistency_score * 0.20) +
            (completion_score * 0.15)
        )
        
        # Round final scores to two decimal places
        readiness_score = round(max(0.0, min(10.0, readiness_score)), 2)
        avg_tech = round(avg_tech, 2)
        avg_comm = round(avg_comm, 2)
        consistency_score = round(consistency_score, 2)

        # Category mapping
        if readiness_score < 4.0:
            category = "At Risk"
        elif readiness_score < 6.0:
            category = "Needs Improvement"
        elif readiness_score < 7.5:
            category = "Good"
        elif readiness_score < 9.0:
            category = "Placement Ready"
        else:
            category = "Excellent"

        # Group by subject to extract weak/strong areas
        subject_scores: dict[str, list[float]] = {}
        for h in completed_interviews:
            subj = h.get("subject")
            if not subj:
                continue
            subj = subj.strip()
            score = h.get("overall_score")
            if score is None:
                continue
            if subj not in subject_scores:
                subject_scores[subj] = []
            subject_scores[subj].append(score)

        weak_subjects = []
        strong_subjects = []
        for subj, scores in subject_scores.items():
            avg_score = sum(scores) / len(scores)
            if avg_score < 6.0:
                weak_subjects.append(subj)
            elif avg_score >= 7.5:
                strong_subjects.append(subj)

        # Trend calculation (requires at least 3 completed interviews)
        if len(completed_interviews) < 3:
            trend = "Insufficient Data"
        else:
            # Sort chronologically by date
            sorted_history = sorted(completed_interviews, key=lambda x: x.get("created_at") or datetime.datetime.min)
            sorted_scores = [h["overall_score"] for h in sorted_history if h.get("overall_score") is not None]
            
            n = len(sorted_scores)
            if n < 3:
                trend = "Insufficient Data"
            else:
                mid = n // 2
                first_half = sorted_scores[:mid]
                second_half = sorted_scores[mid:]
                
                mean_first = sum(first_half) / len(first_half) if first_half else 0.0
                mean_second = sum(second_half) / len(second_half) if second_half else 0.0
                diff = mean_second - mean_first
                
                if diff > 0.5:
                    trend = "Improving"
                elif diff < -0.5:
                    trend = "Declining"
                else:
                    trend = "Stable"

        return ReadinessResponse(
            user_id=user_id,
            candidate_name=candidate_name,
            readiness_score=readiness_score,
            technical_score=avg_tech,
            communication_score=avg_comm,
            category=category,
            weak_subjects=sorted(weak_subjects),
            strong_subjects=sorted(strong_subjects),
            total_interviews=total_interviews,
            consistency_score=consistency_score,
            trend=trend
        )
