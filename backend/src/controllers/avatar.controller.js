/* Avatar interview endpoints — ported from `Avatar Interviews/server.js` so the
   real-time avatar studio can run natively inside the GLAMIS client (at /live)
   instead of the separate :8080 app. These return RAW JSON in the exact shapes
   the studio expects (NOT the ApiResponse wrapper). Uses Node global fetch.

   Env (backend .env):
     SPEECH_KEY, SPEECH_REGION  — Azure Speech resource (avatar + STT)
     AGENT_URL                  — FastAPI interview agent base (e.g. http://localhost:8010)
*/

const SPEECH_KEY = process.env.SPEECH_KEY;
const SPEECH_REGION = process.env.SPEECH_REGION;
// The agent runs on its own port (NOT 8000 — that's this backend). Set AGENT_URL
// in .env to the FastAPI agent; default mirrors the avatar app's local setup.
const AGENT_URL = (process.env.AGENT_URL || "http://localhost:8010").replace(/\/+$/, "");
const AGENT_PREFIX = "/api/v1";
const JSON_HEADERS = { "Content-Type": "application/json" };

/** Probe whether the interview agent is up (short timeout, never throws). */
async function agentReachable() {
    try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 1500);
        const r = await fetch(`${AGENT_URL}${AGENT_PREFIX}/health`, { signal: ctrl.signal });
        clearTimeout(t);
        return r.ok;
    } catch (_) {
        return false;
    }
}

async function agentFetch(pathname, init) {
    const r = await fetch(`${AGENT_URL}${AGENT_PREFIX}${pathname}`, init);
    const text = await r.text();
    let body;
    try {
        body = text ? JSON.parse(text) : {};
    } catch (_) {
        body = { raw: text };
    }
    return { ok: r.ok, status: r.status, body };
}

// Feature flag for the client: is the interview agent (questions + scoring) up?
export const getConfig = async (req, res) => {
    res.json({ agentEnabled: await agentReachable() });
};

// Short-lived Azure speech authorization token (~10 min) so the key stays server-side.
export const getSpeechToken = async (req, res) => {
    try {
        const r = await fetch(
            `https://${SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
            { method: "POST", headers: { "Ocp-Apim-Subscription-Key": SPEECH_KEY, "Content-Length": "0" } }
        );
        if (!r.ok) {
            const detail = await r.text();
            return res.status(r.status).json({ error: "issueToken failed", detail });
        }
        const token = await r.text();
        res.json({ token, region: SPEECH_REGION });
    } catch (err) {
        res.status(500).json({ error: "issueToken request error", detail: String(err) });
    }
};

// ICE relay token for the WebRTC peer connection carrying the avatar's video/audio.
export const getIceToken = async (req, res) => {
    try {
        const r = await fetch(
            `https://${SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`,
            { headers: { "Ocp-Apim-Subscription-Key": SPEECH_KEY } }
        );
        if (!r.ok) {
            const detail = await r.text();
            return res.status(r.status).json({ error: "relay token failed", detail });
        }
        res.json(await r.json());
    } catch (err) {
        res.status(500).json({ error: "relay token request error", detail: String(err) });
    }
};

// Begin a session → { session_id, first_question }.
export const interviewStart = async (req, res) => {
    const { name, role, type, difficulty, experience, skills } = req.body || {};
    try {
        const { ok, status, body } = await agentFetch("/start-interview", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify({
                candidate_name: (name && name.trim()) || "Candidate",
                role: (role && role.trim()) || "the role",
                experience: (experience && experience.trim()) || "Not specified",
                skills: Array.isArray(skills) ? skills : [],
                interview_type: type || null,
                difficulty: difficulty || null,
            }),
        });
        if (!ok) return res.status(status).json({ error: "agent start failed", detail: body });
        res.json({ session_id: body.session_id, first_question: body.first_question });
    } catch (err) {
        res.status(502).json({ error: "interview agent unreachable", detail: String(err.message || err) });
    }
};

// Submit one answer → { evaluation, next_question, difficulty, interview_complete }.
export const interviewAnswer = async (req, res) => {
    const { session_id, answer } = req.body || {};
    if (!session_id) return res.status(400).json({ error: "session_id is required" });
    const safeAnswer = answer && answer.trim() ? answer : "(No answer provided.)";
    try {
        const { ok, status, body } = await agentFetch("/submit-answer", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify({ session_id, answer: safeAnswer }),
        });
        if (!ok) return res.status(status).json({ error: "agent answer failed", detail: body });
        res.json({
            evaluation: body.evaluation,
            next_question: body.next_question,
            difficulty: body.difficulty,
            interview_complete: body.interview_complete,
        });
    } catch (err) {
        res.status(502).json({ error: "interview agent unreachable", detail: String(err.message || err) });
    }
};

// Final report for a session.
export const interviewReport = async (req, res) => {
    try {
        const { ok, status, body } = await agentFetch(
            `/interview-report/${encodeURIComponent(req.params.id)}`,
            { method: "GET" }
        );
        if (!ok) return res.status(status).json({ error: "agent report failed", detail: body });
        res.json(body.report || body);
    } catch (err) {
        res.status(502).json({ error: "interview agent unreachable", detail: String(err.message || err) });
    }
};
