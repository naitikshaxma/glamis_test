/* studio.js — boots the studio: populates setup, acquires media + tokens,
   wires the InterviewEngine to the UI, and renders the debrief.
   Ported 1:1 from the previous public/js/app.js IIFE into an init function the
   React App calls once on mount; the only changes are module imports replacing
   the old window.* globals. SpeechSDK is still the global from the CDN script. */

/* global SpeechSDK */

import { STUDIO } from "./config.js";
import { AvatarController } from "./lib/avatar.js";
import { SpeechController } from "./lib/recognizer.js";
import { InterviewEngine } from "./lib/interview.js";
import { Report } from "./lib/report.js";

// All studio API calls now hit the GLAMIS backend's namespaced avatar routes
// (ported from the old :8080 server) instead of same-origin /api/*.
const AVATAR_API = (import.meta.env.VITE_BACKEND_URL || "") + "/api/v1/avatar";

export function initStudio(opts = {}) {
    // When autoStart is set, the studio enters the interview on its own (no
    // "Start interview" click) once the agent check + Speech SDK are ready — the
    // student already confirmed on the pre-interview review screen.
    const autoStart = !!opts.autoStart;
    const $ = (id) => document.getElementById(id);
    const screens = {
        setup: $("screen-setup"),
        studio: $("screen-studio"),
        debrief: $("screen-debrief"),
    };
    function show(name) {
        Object.values(screens).forEach((s) => s.classList.remove("is-active"));
        screens[name].classList.add("is-active");
        window.scrollTo(0, 0);
    }

    const state = {
        aiEnabled: false,
        agentEnabled: false,
        auth: { token: null, region: null },
        ice: null,
        avatar: null,
        recognizer: null,
        engine: null,
        config: null,
        media: null,
        meterRAF: null,
        refreshTimer: null,
        lastData: null,
        lastEval: null,
    };

    /* ---------- Setup screen population ---------- */
    function populateSelects() {
        const charSel = $("f-character"), styleSel = $("f-style"), voiceSel = $("f-voice");
        charSel.innerHTML = Object.entries(STUDIO.AVATARS)
            .map(([id, a]) => `<option value="${id}">${a.label} (${a.gender})</option>`).join("");
        voiceSel.innerHTML = STUDIO.VOICES
            .map((v) => `<option value="${v.id}" data-gender="${v.gender}">${v.label}</option>`).join("");
        charSel.value = STUDIO.DEFAULTS.character;
        const fillStyles = () => {
            const styles = STUDIO.AVATARS[charSel.value].styles;
            styleSel.innerHTML = styles.map((s) => `<option value="${s}">${s.replace(/-/g, " ")}</option>`).join("");
        };
        // Lock voices that don't match the interviewer's gender, and select the
        // matching default. The opposite-gender options become unselectable.
        const lockVoicesToGender = () => {
            const gender = STUDIO.AVATARS[charSel.value].gender;
            [...voiceSel.options].forEach((o) => { o.disabled = o.dataset.gender !== gender; });
            const match = STUDIO.DEFAULT_VOICE_BY_GENDER[gender];
            if (match) voiceSel.value = match;
        };
        charSel.addEventListener("change", () => { fillStyles(); lockVoicesToGender(); });
        fillStyles();
        lockVoicesToGender();
        styleSel.value = STUDIO.DEFAULTS.style;
    }

    // Resolve once the Speech SDK global is available (or its load failed), so
    // an auto-start doesn't fire before SpeechSDK exists.
    function whenSdkReady(cb) {
        if (typeof SpeechSDK !== "undefined" || window.__sdkLoadFailed) return cb();
        const t = setInterval(() => {
            if (typeof SpeechSDK !== "undefined" || window.__sdkLoadFailed) {
                clearInterval(t); cb();
            }
        }, 100);
    }

    async function checkAi() {
        try {
            const r = await fetch(`${AVATAR_API}/config`);
            const data = await r.json();
            state.agentEnabled = !!data.agentEnabled;
        } catch (_) { state.agentEnabled = false; }
        // The interview agent supplies both questions and scoring, so AI features
        // track agent availability rather than a server-side OpenAI key.
        state.aiEnabled = state.agentEnabled;
        const note = $("ai-availability"), box = $("f-ai"), btn = $("btn-enter");
        if (state.agentEnabled) {
            note.textContent = "(agent-scored)"; box.disabled = false; box.checked = true;
            // Agent is reachable — kick off the interview without a manual click.
            if (autoStart) whenSdkReady(() => enterStudio({ preventDefault() {} }));
        } else {
            note.textContent = "(start the interview agent on :8000)";
            box.disabled = true; box.checked = false;
            setStatusError("Interview agent not reachable — start it on port 8000, then reload.");
            if (btn) btn.disabled = true;
        }
    }

    /* ---------- UI adapter passed to the engine ---------- */
    const ui = {
        setStatus(mode, text) {
            const el = $("stage-status");
            el.className = "stage-status" + (mode === "speaking" ? " speaking" : mode === "listening" ? " listening" : "");
            $("stage-status-text").textContent = text;
            $("onair").classList.toggle("live", mode === "listening" || mode === "speaking");
        },
        showCaption(text) {
            const cap = $("caption");
            cap.hidden = false; cap.style.animation = "none"; void cap.offsetWidth;
            cap.style.animation = "";
            $("caption-text").textContent = text;
        },
        setProgress(index, total) {
            $("studio-progress").textContent = `Question ${index + 1} of ${total}`;
            $("progress-bar").style.width = ((index) / total * 100) + "%";
        },
        setProgressLabel(text) {
            $("studio-progress").textContent = text;
            $("progress-bar").style.width = "0%";
        },
        setInterim(text) { $("transcript-interim").textContent = text; },
        setFinal(text) {
            $("transcript-final").textContent = text;
            $("transcript-hint").style.display = text ? "none" : "block";
        },
        clearTranscript() {
            $("transcript-final").textContent = "";
            $("transcript-interim").textContent = "";
            $("transcript-hint").style.display = "block";
        },
        setRecState(text, live) {
            const el = $("rec-state");
            el.textContent = text; el.classList.toggle("live", !!live);
        },
        setControls({ repeat, rerecord, submit, skip }) {
            $("btn-repeat").disabled = !repeat;
            $("btn-rerecord").disabled = !rerecord;
            $("btn-submit").disabled = !submit;
            $("btn-skip").disabled = !skip;
        },
        setTimer(t) { $("studio-timer").textContent = t; },
        toast(msg) {
            const t = $("studio-toast");
            t.textContent = msg; t.hidden = false;
            clearTimeout(t._h); t._h = setTimeout(() => (t.hidden = true), 4000);
        },
    };

    /* ---------- Proctoring / lockdown ----------
       Best-effort, within hard browser limits: a web page CANNOT truly prevent
       leaving full screen, block extensions, or trap reserved Chrome shortcuts
       (Ctrl+T/W/N, Alt+Tab, window close). For a real lockdown launch Chrome via
       start-kiosk.bat (--kiosk --disable-extensions, clean profile). Here we:
       enter full screen on start, gate with a blocking overlay whenever the user
       leaves full screen / switches tab, disable the context menu and the
       blockable devtools/reload shortcuts, and warn on unload. */
    const proctor = {
        active: false,
        violations: 0,
        pendingBegin: false, // begin the interview once full screen is first entered
        _bound: null,

        requestFullscreen() {
            const el = document.documentElement;
            const fn = el.requestFullscreen || el.webkitRequestFullscreen;
            try { return Promise.resolve(fn && fn.call(el)); } catch (_) { return Promise.resolve(); }
        },
        isFullscreen() { return !!(document.fullscreenElement || document.webkitFullscreenElement); },
        exitFullscreen() {
            const fn = document.exitFullscreen || document.webkitExitFullscreen;
            try { if (fn && this.isFullscreen()) return Promise.resolve(fn.call(document)); } catch (_) {}
            return Promise.resolve();
        },

        start() {
            if (this.active) return;
            this.active = true;
            this.violations = 0;
            const chip = $("proctor-chip"); if (chip) chip.hidden = false;

            this._bound = {
                fs: () => this._onFsChange(),
                vis: () => { if (this.active && document.hidden) this._flag("You switched away from the interview tab."); },
                ctx: (e) => { if (this.active) e.preventDefault(); },
                key: (e) => this._onKey(e),
                blur: () => { if (this.active) this._flag("The interview window lost focus."); },
                unload: (e) => { if (this.active) { e.preventDefault(); e.returnValue = ""; return ""; } },
            };
            document.addEventListener("fullscreenchange", this._bound.fs);
            document.addEventListener("webkitfullscreenchange", this._bound.fs);
            document.addEventListener("visibilitychange", this._bound.vis);
            document.addEventListener("contextmenu", this._bound.ctx, true);
            window.addEventListener("keydown", this._bound.key, true);
            window.addEventListener("blur", this._bound.blur);
            window.addEventListener("beforeunload", this._bound.unload);

            const resume = $("lock-resume");
            if (resume) resume.onclick = async () => {
                await this.requestFullscreen();
                setTimeout(() => { if (this.isFullscreen()) this._hideLock(); }, 150);
            };

            // If the in-gesture fullscreen request didn't take, gate immediately.
            if (!this.isFullscreen()) this._showLock("Click below to enter full screen and begin.");
        },

        stop() {
            if (!this.active) return;
            this.active = false; // set before exiting FS so _onFsChange ignores it
            const chip = $("proctor-chip"); if (chip) chip.hidden = true;
            if (this._bound) {
                document.removeEventListener("fullscreenchange", this._bound.fs);
                document.removeEventListener("webkitfullscreenchange", this._bound.fs);
                document.removeEventListener("visibilitychange", this._bound.vis);
                document.removeEventListener("contextmenu", this._bound.ctx, true);
                window.removeEventListener("keydown", this._bound.key, true);
                window.removeEventListener("blur", this._bound.blur);
                window.removeEventListener("beforeunload", this._bound.unload);
                this._bound = null;
            }
            this._hideLock();
            this.exitFullscreen();
        },

        _onFsChange() {
            if (!this.active) return;
            if (!this.isFullscreen()) {
                this._flag("You left full-screen mode.");
                this._showLock("You left full-screen mode. The interview must stay in full screen.");
            } else {
                this._hideLock();
                if (this.pendingBegin) {
                    this.pendingBegin = false;
                    if (state.engine) state.engine.begin();
                } else if (state.engine) {
                    state.engine.resumeFromLock();
                }
            }
        },
        _onKey(e) {
            if (!this.active) return;
            const k = (e.key || "").toLowerCase();
            const ctrl = e.ctrlKey || e.metaKey;
            const block =
                e.key === "F12" || e.key === "F11" || e.key === "F5" ||
                (ctrl && e.shiftKey && ["i", "j", "c"].includes(k)) ||
                (ctrl && ["u", "s", "p", "r", "t", "n", "w"].includes(k));
            if (block) { e.preventDefault(); e.stopPropagation(); }
        },
        _flag(msg) {
            this.violations += 1;
            console.warn(`[proctor] violation #${this.violations}: ${msg}`);
            const note = $("lock-note"); if (note) note.textContent = `Flagged events: ${this.violations}`;
            ui.toast("Proctor: " + msg);
        },
        _showLock(msg) {
            const ov = $("lock-overlay"), m = $("lock-msg"), note = $("lock-note");
            if (m && msg) m.textContent = msg;
            if (note) note.textContent = this.violations ? `Flagged events: ${this.violations}` : "";
            if (ov) ov.hidden = false;
            if (state.engine) state.engine.pauseForLock(); // stop capturing while locked
        },
        _hideLock() { const ov = $("lock-overlay"); if (ov) ov.hidden = true; },
    };

    /* ---------- Token helpers ---------- */
    async function getJSON(url, opts) {
        const r = await fetch(url, opts);
        if (!r.ok) throw new Error(`${url} → ${r.status}`);
        return r.json();
    }
    function startTokenRefresh() {
        stopTokenRefresh();
        state.refreshTimer = setInterval(async () => {
            try {
                const s = await getJSON(`${AVATAR_API}/speech-token`);
                state.auth.token = s.token;
                state.avatar && state.avatar.refreshToken(s.token);
            } catch (_) { /* will retry next tick */ }
        }, 8 * 60 * 1000);
    }
    function stopTokenRefresh() { if (state.refreshTimer) { clearInterval(state.refreshTimer); state.refreshTimer = null; } }

    /* ---------- Avatar connect (with safe fallback) ---------- */
    function buildAvatar() {
        const a = new AvatarController($("avatar-video"));
        a.onConnected = () => {
            $("stage-empty").style.display = "none";
            $("onair").classList.add("live");
        };
        return a;
    }
    async function connectAvatar(character, style, voice, ice) {
        state.avatar = buildAvatar();
        try {
            await state.avatar.connect({
                token: state.auth.token, region: state.auth.region, ice,
                character, style, voice, onEvent: () => {},
            });
        } catch (err) {
            // The character/style may be invalid for the real-time API (ws 1007).
            // Retry once with the canonical, always-supported avatar.
            const isDefault = character === "lisa" && style === "casual-sitting";
            if (isDefault) throw err;
            try { state.avatar.close(); } catch (_) {}
            setStatusNote(`"${character} / ${style}" isn't available for live avatar — using Lisa instead…`);
            state.avatar = buildAvatar();
            await state.avatar.connect({
                token: state.auth.token, region: state.auth.region, ice,
                character: "lisa", style: "casual-sitting", voice, onEvent: () => {},
            });
            state.config.character = "lisa"; state.config.style = "casual-sitting";
        }
    }

    /* ---------- Media (self-view + mic meter) ---------- */
    async function startMedia(wantVideo) {
        try {
            state.media = await navigator.mediaDevices.getUserMedia({
                video: wantVideo,
                // Clean voice capture: cancel the avatar's speaker echo + noise.
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            });
        } catch (e) {
            ui.toast("Camera/mic permission needed for the interview.");
            throw e;
        }
        const wrap = $("self-wrap");
        if (wantVideo) {
            $("self-video").srcObject = state.media; wrap.classList.remove("off");
        } else {
            wrap.classList.add("off");
        }
        setupAudioGraph(state.media);
    }

    // One 16 kHz AudioContext + source node, shared by the level meter and the
    // STT push stream — so the microphone is only ever opened once.
    function setupAudioGraph(stream) {
        let ctx;
        try { ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 }); }
        catch (_) { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
        if (ctx.resume) ctx.resume();
        const source = ctx.createMediaStreamSource(stream);
        state.audio = { ctx, source };

        const meter = $("mic-meter");
        const N = 14;
        meter.innerHTML = Array.from({ length: N }, () => "<i></i>").join("");
        const bars = [...meter.querySelectorAll("i")];
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        const buf = new Uint8Array(analyser.frequencyBinCount);
        const loop = () => {
            analyser.getByteFrequencyData(buf);
            bars.forEach((b, i) => {
                const v = buf[i + 1] / 255;
                b.style.height = Math.max(8, v * 100) + "%";
                b.style.opacity = 0.35 + v * 0.6;
            });
            state.meterRAF = requestAnimationFrame(loop);
        };
        loop();
    }

    /* ---------- Interview agent client (proxied through our server) ---------- */
    const agent = {
        start(config) {
            return getJSON(`${AVATAR_API}/interview/start`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: config.name, role: config.role, type: config.type,
                    difficulty: config.difficulty, experience: config.experience,
                }),
            });
        },
        answer(sessionId, text) {
            return getJSON(`${AVATAR_API}/interview/answer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: sessionId, answer: text }),
            });
        },
        report(sessionId) {
            return getJSON(`${AVATAR_API}/interview/report/${encodeURIComponent(sessionId)}`);
        },
    };

    /* ---------- Enter the studio ---------- */
    async function enterStudio(e) {
        e.preventDefault();
        if (window.__sdkLoadFailed || typeof SpeechSDK === "undefined") {
            setStatusError("Speech SDK failed to load — check your network/extensions and reload.");
            return;
        }
        const btn = $("btn-enter");
        btn.disabled = true;
        const config = {
            name: $("f-name").value.trim() || "Candidate",
            role: $("f-role").value.trim() || "the role",
            type: $("f-type").value,
            difficulty: $("f-difficulty").value,
            experience: $("f-experience") ? $("f-experience").value : "",
            count: parseInt($("f-count").value, 10),
            character: $("f-character").value,
            style: $("f-style").value,
            voice: $("f-voice").value,
            webcam: $("f-webcam").checked,
            ai: $("f-ai").checked && state.aiEnabled,
        };
        state.config = config;

        // Enter full screen now, while we still hold the click gesture (it would
        // be rejected after the awaits below). proctor.start() re-gates if it fails.
        proctor.requestFullscreen().catch(() => {});

        try {
            setStatusNote("Requesting camera & microphone…");
            await startMedia(config.webcam);

            setStatusNote("Connecting to the interviewer…");
            const [speech, ice] = await Promise.all([getJSON(`${AVATAR_API}/speech-token`), getJSON(`${AVATAR_API}/ice-token`)]);
            state.auth = { token: speech.token, region: speech.region };
            state.ice = ice;

            setStatusNote("Starting your interview session…");
            const session = await agent.start(config);
            if (!session || !session.session_id || !session.first_question) {
                throw new Error("The interview agent did not return a question.");
            }

            await connectAvatar(config.character, config.style, config.voice, ice);

            state.recognizer = new SpeechController({
                onInterim: ui.setInterim, onFinal: ui.setFinal,
            });
            state.recognizer.attachAudio(state.audio);

            state.engine = new InterviewEngine({
                avatar: state.avatar, recognizer: state.recognizer, ui,
                auth: state.auth, config, agent,
                sessionId: session.session_id,
                firstQuestion: session.first_question,
                maxTurns: config.count,
                onComplete: finishInterview,
            });

            const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
            $("studio-type").textContent =
                `${STUDIO.TYPE_LABELS[config.type]} · ${cap(config.difficulty)}`;
            wireControls();
            startTokenRefresh();
            show("studio");
            proctor.start();
            // Begin now if we're already full screen; otherwise the proctor gate
            // begins it the moment the candidate enters full screen.
            if (proctor.isFullscreen()) state.engine.begin();
            else proctor.pendingBegin = true;
        } catch (err) {
            proctor.exitFullscreen();
            btn.disabled = false;
            setStatusError("Couldn't start: " + (err.message || err));
        }
    }

    function setStatusNote(msg) { const s = $("setup-status"); s.classList.remove("error"); s.textContent = msg; }
    function setStatusError(msg) { const s = $("setup-status"); s.classList.add("error"); s.textContent = msg; }

    /* ---------- Studio controls ---------- */
    function wireControls() {
        $("btn-submit").onclick = () => state.engine.submit();
        $("btn-repeat").onclick = () => state.engine.repeat();
        $("btn-rerecord").onclick = () => state.engine.rerecord();
        $("btn-skip").onclick = () => state.engine.skip();
        // Use an in-page confirmation overlay, NOT window.confirm(): the native
        // dialog drops the browser out of full screen, which trips the proctor
        // lock and traps the candidate in a "resume full screen" loop.
        const endOverlay = $("end-overlay");
        $("btn-end").onclick = () => {
            if (endOverlay) endOverlay.hidden = false;
            else if (state.engine) state.engine.end();
        };
        const endConfirm = $("end-confirm"), endCancel = $("end-cancel");
        if (endConfirm) endConfirm.onclick = () => {
            if (endOverlay) endOverlay.hidden = true;
            if (state.engine) state.engine.end();
        };
        if (endCancel) endCancel.onclick = () => { if (endOverlay) endOverlay.hidden = true; };
    }

    /* ---------- Finish → debrief ---------- */
    function finishInterview(results, report) {
        proctor.stop(); // lift the lock before we drop out of full screen
        const data = Report.compute(results);
        // Scores/feedback come from the agent: per-answer evaluations collected
        // during the interview, plus its final report.
        const evaluation = state.config.ai ? Report.fromAgent(results, report) : null;
        state.lastData = data; state.lastEval = evaluation;
        Report.render(screens.debrief, state.config, data, evaluation);
        teardownLive();
        show("debrief");
    }

    function teardownLive() {
        stopTokenRefresh();
        if (state.meterRAF) cancelAnimationFrame(state.meterRAF);
        try { state.avatar && state.avatar.close(); } catch (_) {}
        try { state.audio && state.audio.ctx && state.audio.ctx.close(); } catch (_) {}
        try { state.media && state.media.getTracks().forEach((t) => t.stop()); } catch (_) {}
        state.avatar = null; state.audio = null;
    }

    /* ---------- Deep-link prefill ----------
       The GLAMIS create-interview page can launch this studio with the chosen
       interview already configured, e.g. /?type=dsa&role=Backend%20Developer&
       difficulty=medium&count=5&name=Priya&source=glamis. We prefill the setup
       form; the candidate still clicks "Enter the studio" (the in-gesture click
       is required for full screen + microphone). */
    function applyQueryPrefill() {
        const q = new URLSearchParams(window.location.search);
        if (![...q.keys()].length) return;
        const setInput = (id, val) => { const el = $(id); if (el && val != null && val !== "") el.value = val; };
        const setSelect = (id, val) => {
            const el = $(id);
            if (!el || val == null || val === "") return;
            if ([...el.options].some((o) => o.value === val)) el.value = val;
        };
        setInput("f-name", q.get("name"));
        setInput("f-role", q.get("role"));
        setSelect("f-type", q.get("type"));
        setSelect("f-difficulty", q.get("difficulty"));
        setSelect("f-count", q.get("count"));
        setSelect("f-experience", q.get("experience"));
        if (q.get("source") === "glamis") {
            setStatusNote('Configured from GLAMIS — review the details and click "Enter the studio" to begin.');
        }
    }

    /* ---------- Debrief actions ---------- */
    // "New interview": let the host (React) decide where to go — it clears the
    // avatar session and routes to /create-interview. Falls back to a reload.
    $("btn-restart").onclick = opts.onRestart || (() => window.location.reload());
    $("btn-download").onclick = () => {
        const text = Report.toTranscript(state.config, state.lastData, state.lastEval);
        const blob = new Blob([text], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `interview-${state.config.name.replace(/\s+/g, "-").toLowerCase()}.txt`;
        a.click(); URL.revokeObjectURL(a.href);
    };

    /* ---------- Boot ---------- */
    populateSelects();
    applyQueryPrefill();
    checkAi();
    $("setup-form").addEventListener("submit", enterStudio);
}
