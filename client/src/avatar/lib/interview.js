/* InterviewEngine — orchestrates the interview. The avatar asks each question
   aloud, the candidate answers by speaking (continuous STT), and the engine
   advances through the set. Questions and scoring come live from the interview
   agent: the first question is fetched at session start, and each submitted
   answer is sent to the agent, which returns the evaluation + the next question
   (adapting difficulty and inserting follow-ups as it sees fit). */

import { STUDIO } from "../config.js";

export class InterviewEngine {
    /**
     * @param {{avatar, recognizer, ui, auth, config, agent, sessionId,
     *          firstQuestion, maxTurns, onComplete}} deps
     *  - agent: { answer(sessionId, text), report(sessionId) } client (studio.js)
     *  - onComplete(results, report): called when the interview ends
     */
    constructor(deps) {
        this.avatar = deps.avatar;
        this.recognizer = deps.recognizer;
        this.ui = deps.ui;
        this.auth = deps.auth;              // { token, region } — kept fresh by studio.js
        this.config = deps.config;          // { name, role, type, difficulty, ... }
        this.agent = deps.agent;            // agent client
        this.sessionId = deps.sessionId;
        this.currentQuestion = deps.firstQuestion || "";
        this.maxTurns = Math.max(1, deps.maxTurns || 5);
        this.onComplete = deps.onComplete;

        this.turn = 0;                      // answers submitted so far
        this.results = [];
        this.state = "idle";                // idle | speaking | listening | thinking | done
        this._listenStart = 0;
        this._timerId = null;
        this._tick = 0;
        this._lockedPaused = false;         // listening was paused by the proctor lock
    }

    firstName() { return (this.config.name || "there").trim().split(/\s+/)[0]; }

    async begin() {
        this.ui.setProgressLabel("Introduction");
        const typeLabel = (STUDIO.TYPE_LABELS[this.config.type] || "mock").toLowerCase();
        const greeting =
            `Hi ${this.firstName()}, welcome, and thanks for coming in. ` +
            `I'll be your interviewer today for this ${typeLabel} interview for the ${this.config.role} role. ` +
            `I have a few questions for you. There are no trick answers — take your time, think out loud, ` +
            `and just start speaking when you're ready. Let's begin.`;
        await this._say(greeting, "Warming up");
        await this._ask(this.currentQuestion);
    }

    /** Show, speak, then listen for the given question. */
    async _ask(question) {
        this.ui.setProgress(this.turn, this.maxTurns);
        this.ui.showCaption(question);
        await this._say(question, "Interviewer is asking");
        this._beginListening();
    }

    /** Speak text with the avatar; pauses any active listening around it. */
    async _say(text, statusText) {
        const wasListening = this.state === "listening";
        if (wasListening) await this._pauseListening();
        this.state = "speaking";
        this.ui.setStatus("speaking", statusText || "Interviewer is speaking");
        this.ui.setControls({ repeat: false, rerecord: false, submit: false, skip: false });
        try { await this.avatar.speak(text); } catch (e) { this.ui.toast(String(e.message || e)); }
    }

    _beginListening() {
        this.state = "listening";
        this.ui.setStatus("listening", "Listening — go ahead");
        this.ui.setRecState("Recording", true);
        this.ui.setControls({ repeat: true, rerecord: true, submit: true, skip: true });
        this._listenStart = Date.now();
        this._startTimer();
        Promise.resolve(this.recognizer.start(this.auth.token, this.auth.region)).catch((e) => {
            this.ui.toast("Microphone error: " + (e.message || e));
        });
    }

    async _pauseListening() {
        this._stopTimer();
        this.ui.setRecState("Paused", false);
        await this.recognizer.stop(); // keeps finalText for this answer
    }

    /** Proctor lock raised: stop capturing audio so nothing is recorded while locked. */
    async pauseForLock() {
        if (this.state === "listening" && !this._lockedPaused) {
            this._lockedPaused = true;
            await this._pauseListening();
            this.ui.setStatus("idle", "Paused — interview locked");
        }
    }

    /** Proctor lock cleared (back in full screen): resume listening if we paused. */
    resumeFromLock() {
        if (this._lockedPaused) {
            this._lockedPaused = false;
            this._beginListening();
        }
    }

    /** Submit the spoken answer for the current question. */
    async submit() {
        if (this.state !== "listening") return;
        this._stopTimer();
        const answer = await this.recognizer.stop();
        await this._sendAnswer(answer || "");
    }

    /** Skip — advance with an explicit no-answer so the agent still scores/moves on. */
    async skip() {
        if (this.state !== "listening") return;
        this._stopTimer();
        await this.recognizer.stop();
        await this._sendAnswer("");
    }

    /** Send one answer to the agent, store the result, and ask the next question. */
    async _sendAnswer(answerText) {
        const answer = (answerText || "").trim();
        const durationMs = Math.max(0, Date.now() - this._listenStart);
        const question = this.currentQuestion;

        this.ui.clearTranscript();
        this.state = "thinking";
        this.ui.setStatus("speaking", "Considering your answer…");
        this.ui.setRecState("Paused", false);
        this.ui.setControls({ repeat: false, rerecord: false, submit: false, skip: false });

        let resp;
        try {
            resp = await this.agent.answer(this.sessionId, answer);
        } catch (e) {
            this.ui.toast("Couldn't reach the interviewer: " + (e.message || e) + " — please try again.");
            this._beginListening(); // let them retry the same question
            return;
        }

        this.results.push({
            type: this.config.type,
            question,
            answer,
            durationMs,
            evaluation: resp.evaluation || null,
            difficulty: resp.difficulty || null,
        });
        this.turn += 1;

        if (resp.interview_complete || this.turn >= this.maxTurns) {
            this.currentQuestion = null;
            await this.end();
            return;
        }

        await this._brief();
        this.currentQuestion = resp.next_question || "";
        if (!this.currentQuestion) { await this.end(); return; }
        await this._ask(this.currentQuestion);
    }

    /** Short acknowledgement between questions for a natural cadence. */
    async _brief() {
        const acks = ["Thank you.", "Got it, thanks.", "Great, thank you.", "Understood — let's continue."];
        const ack = acks[Math.floor(Math.random() * acks.length)];
        await this._say(ack, "Interviewer is responding");
    }

    async repeat() {
        if (this.state !== "listening") return;
        await this._say("Of course. " + this.currentQuestion, "Repeating the question");
        this._beginListening();
    }

    /** Discard current answer transcript and listen again. */
    async rerecord() {
        if (this.state !== "listening") return;
        await this.recognizer.stop();
        this.ui.clearTranscript();
        this._beginListening();
    }

    async end() {
        if (this.state === "done") return;
        if (this.recognizer.isRunning && this.recognizer.isRunning()) await this.recognizer.stop();
        this._stopTimer();
        this.state = "done";
        const closing =
            `That's everything from my side, ${this.firstName()}. ` +
            `Thanks for taking the time — I'm putting your debrief together now. Take care.`;
        await this._say(closing, "Wrapping up");
        this.ui.setStatus("idle", "Interview complete");

        let report = null;
        try {
            report = await this.agent.report(this.sessionId);
        } catch (e) {
            this.ui.toast("Could not load the final report: " + (e.message || e));
        }
        if (this.onComplete) this.onComplete(this.results, report);
    }

    /* ---- visible count-up timer ---- */
    _startTimer() {
        this._stopTimer();
        this._tick = 0;
        this.ui.setTimer("00:00");
        this._timerId = setInterval(() => {
            this._tick += 1;
            const m = String(Math.floor(this._tick / 60)).padStart(2, "0");
            const s = String(this._tick % 60).padStart(2, "0");
            this.ui.setTimer(`${m}:${s}`);
        }, 1000);
    }
    _stopTimer() { if (this._timerId) { clearInterval(this._timerId); this._timerId = null; } }
}
