# Interview Assignment Agent

## Overview

The **Interview Assignment Agent** is the Phase 2 intelligence layer of GLAMIS. It consumes a student's computed readiness profile and produces a **ranked, personalized interview assignment roadmap** — a prioritized list of interview types the student should complete next, with rationale, estimated duration, and prerequisite checks.

The agent is **fully stateless**: it generates recommendations on demand and does not persist data. Node.js remains the single source of truth for all stored assignments.

---

## Architecture

```
Node.js (source of truth)
        │  student data, interview records
        ▼
FastAPI: ReadinessService
        │  computes readiness score, weak/strong subjects, trend
        ▼
FastAPI: InterviewAssignmentService   ◄── orchestrator
        │
        ├── InterviewAssignmentAgent [LLM mode]
        │       uses OpenAI GPT + interview_assignment_agent.txt prompt
        │
        └── InterviewAssignmentAgent [Rule mode]  ← fallback
                deterministic rule engine (no LLM required)
```

---

## Interview Types Supported

| Type | Duration | Description |
|---|---|---|
| DSA Interview | 45 min | Data Structures & Algorithms |
| DBMS Interview | 40 min | Database Management Systems |
| OS Interview | 40 min | Operating Systems |
| CN Interview | 40 min | Computer Networks |
| Verbal Interview | 30 min | Communication & Fluency |
| HR Interview | 45 min | Behavioural & HR Round |
| Placement Drive | 90 min | Full company mock placement drive |
| Written Test | 60 min | Aptitude, Reasoning, English |
| Company Mock | 60 min | Company-specific technical mock |

---

## Rule Engine Logic

The agent uses a deterministic rule engine as the primary recommendation strategy (with LLM as an optional enhancement):

### Priority Levels
- **Critical** — Severe deficit; must address immediately
- **High** — Significant gap; strongly recommended
- **Medium** — Well-rounded preparation; recommended
- **Low** — Optional polish

### Decision Rules

| Condition | Interview | Priority |
|---|---|---|
| Weak subject contains DSA/DBMS/OS/CN | Corresponding interview | Critical |
| `communication_score < 6.0` | Verbal Interview | Critical |
| `6.0 ≤ communication_score < 7.5` | Verbal Interview | High |
| `total_interviews < 3` | Written Test | Medium |
| Subject not covered (not strong, not weak) | Corresponding interview | Medium |
| `readiness_score ≥ 7.5` | HR Interview | Medium |
| `jd_match_score ≥ 7.0` | Company Mock | High |
| `readiness_score ≥ 8.5` | Placement Drive | High |

### Constraints
- Maximum **6 recommendations** per roadmap
- Minimum **2 recommendations** always returned
- **No duplicate** interview types
- Strong subjects are not re-recommended (unless required for Placement Drive)
- Placement Drive and Company Mock require `prerequisite_met = true` (readiness ≥ 5.0)

---

## Placement Eligibility

A student is `placement_eligible: true` when ALL of the following hold:

```
readiness_score  ≥ 7.5
technical_score  ≥ 7.0
communication_score ≥ 6.5
trend in ["Improving", "Stable"]
```

---

## API Endpoints

All endpoints are prefixed at: `GET/POST /api/v1/admin/assignment/`

### 1. GET `/roadmap/{user_id}`

Generate a roadmap for a single candidate via URL path.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `jd_match_score` | float | No | JD match score 0–10 |
| `target_company` | string | No | Target company name |

**Example Request:**
```http
GET /api/v1/admin/assignment/roadmap/mock_high?jd_match_score=8.5&target_company=Google
```

**Example Response:**
```json
{
  "userId": "mock_high",
  "candidateName": "High Candidate",
  "readinessScore": 8.08,
  "readinessCategory": "Placement Ready",
  "technicalScore": 7.9,
  "communicationScore": 8.1,
  "consistencyScore": 9.35,
  "trend": "Stable",
  "weakSubjects": [],
  "strongSubjects": ["DSA", "CN", "Amazon Mock"],
  "totalInterviewsDone": 3,
  "recommendations": [
    {
      "interviewType": "HR Interview",
      "priority": "Medium",
      "rationale": "Readiness score of 8.08/10 qualifies for behavioural/HR round preparation.",
      "estimatedDurationMinutes": 45,
      "prerequisiteMet": true
    },
    {
      "interviewType": "Company Mock",
      "priority": "High",
      "rationale": "JD match score of 8.5/10 is strong; a company-specific mock interview for Google is recommended.",
      "estimatedDurationMinutes": 60,
      "prerequisiteMet": true
    },
    {
      "interviewType": "Placement Drive",
      "priority": "High",
      "rationale": "Readiness score of 8.08/10 qualifies for a full Placement Drive.",
      "estimatedDurationMinutes": 90,
      "prerequisiteMet": true
    }
  ],
  "agentSummary": "High Candidate is currently rated 'Placement Ready' with a readiness score of 8.08/10 and a trend of 'Stable'. Weak areas include: none identified. The most urgent next step is a 'HR Interview'. 3 interview(s) have been recommended to maximize placement readiness.",
  "placementEligible": true,
  "jdMatchScore": 8.5,
  "generatedBy": "InterviewAssignmentAgent[Rules]"
}
```

---

### 2. POST `/roadmap`

Same as GET but accepts a JSON body (useful for passing sensitive fields).

**Request Body:**
```json
{
  "userId": "mock_medium",
  "jdMatchScore": 7.5,
  "targetCompany": "Microsoft"
}
```

---

### 3. POST `/bulk`

Generate roadmaps for multiple candidates in a single request.

**Request Body:**
```json
{
  "userIds": ["mock_low", "mock_medium", "mock_high"],
  "jdMatchScore": null,
  "targetCompany": null
}
```

**Behavior:** Partial successes are returned. Individual user failures do not abort the batch — they are silently skipped. A 404 is returned only if **all** users fail.

---

## LLM Mode

When `OPENAI_API_KEY` is configured, the agent sends the student's readiness profile to GPT using the template at `app/prompts/interview_assignment_agent.txt`.

The LLM is instructed to:
- Apply the same priority rules
- Generate meaningful natural-language rationale per recommendation
- Output a human-readable `agent_summary`

If the LLM call fails (network error, API limit, bad JSON), the agent **automatically falls back** to the rule engine. The `generated_by` field in the response indicates which mode was used:
- `InterviewAssignmentAgent[LLM]` — LLM mode
- `InterviewAssignmentAgent[Rules]` — Rule-based fallback

---

## Test Suite

File: `tests/test_assignment_agent.py`

| Test Class | Tests |
|---|---|
| `TestRuleEngine` | 15 tests covering all priority rules, duplicates, sorting, caps |
| `TestPlacementEligibility` | 4 tests covering all eligibility conditions |
| `TestAgentSummary` | 2 tests verifying summary content |
| `TestAssignmentService` | 5 integration tests for service layer |
| `TestAssignmentAPI` | 11 API endpoint tests |

**Run tests:**
```bash
pytest tests/test_assignment_agent.py -v
```

---

## Files Created

| File | Purpose |
|---|---|
| `app/schemas/assignment.py` | Pydantic schemas (request + response) |
| `app/prompts/interview_assignment_agent.txt` | LLM system prompt |
| `app/agents/interview_assignment_agent.py` | Agent logic (LLM + rule engine) |
| `app/services/interview_assignment_service.py` | Orchestration service |
| `app/api/assignment_routes.py` | FastAPI routes |
| `tests/test_assignment_agent.py` | Pytest test suite |
| `docs/interview_assignment_agent.md` | This document |

---

## Data Flow

```
1. Admin/System calls POST /api/v1/admin/assignment/roadmap
                │
2. assignment_routes.py  →  InterviewAssignmentService.generate_roadmap()
                │
3. ReadinessService.calculate_readiness(user_id)
   → MongoDB (production) or SQLite (dev) or mock fallback
                │
4. ReadinessResponse { readiness_score, weak_subjects, trend, ... }
                │
5. InterviewAssignmentAgent.generate_roadmap(readiness, jd_match_score)
   ├── [LLM]   OpenAI GPT  →  parse _LLMAssignmentOutput
   └── [Rules] deterministic priority logic
                │
6. AssignmentRoadmapResponse { recommendations, agent_summary, placement_eligible }
                │
7. API returns JSON  →  Admin Portal reads and displays
                │
8. Admin reviews  →  clicks Publish  →  Node.js creates assignments
```
