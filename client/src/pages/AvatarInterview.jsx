import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { initStudio } from '../avatar/studio.js';
import { clearAvatarSession } from '../helpers/interviewSession';

/* Native real-time avatar interview, rendered inside the GLAMIS client at /live
   (replaces the old separate :8080 portal). The markup is a JSX port of the
   avatar app's three screens (setup → studio → debrief) + the proctor lock
   overlay, keeping the same ids/classes so the imperative `studio.js` engine and
   the studio stylesheet work unchanged.

   Settings are NO LONGER edited here — that moved to the pre-interview Review
   screen (InterviewSettingsDialog). This setup screen is just a read-only
   "You're all set" summary + Start. The actual form controls still exist (hidden)
   because studio.js reads them by id; they're prefilled from the session config
   (which carries whatever was chosen on the review screen, or the admin's config
   for scheduled interviews).

   On mount we inject the avatar stylesheet + boxicons + Montserrat + the Azure
   Speech SDK (the CSS is removed on unmount so its generic class names can't leak
   into the rest of the client), then boot the studio and apply the session config.
   The student still clicks "Start interview" once (required for camera/mic +
   fullscreen). */

const SDK_SRC =
    'https://cdn.jsdelivr.net/npm/microsoft-cognitiveservices-speech-sdk@1.40.0/distrib/browser/microsoft.cognitiveservices.speech.sdk.bundle-min.js';

export default function AvatarInterview({ session }) {
    const navigate = useNavigate();
    const booted = useRef(false);
    const s = session || {};

    // The interview content settings live in hidden, React-controlled fields that
    // studio.js reads by id at Start. Initialized from the session config.
    const [form, setForm] = useState({
        name: s.name || Cookies.get('fullName') || '',
        role: s.role || '',
        experience: s.experience || '0-2 years',
        type: s.type || 'behavioral',
        difficulty: s.difficulty || 'medium',
        count: String(s.count ?? 5),
    });
    const upd = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    useEffect(() => {
        if (booted.current) return; // guard against an accidental double-mount
        booted.current = true;

        // --- Inject page-scoped assets (removed on unmount where noted) ---
        const injected = [];
        const addLink = (href) => {
            const l = document.createElement('link');
            l.rel = 'stylesheet';
            l.href = href;
            document.head.appendChild(l);
            injected.push(l);
        };
        addLink('/avatar-studio.css');
        addLink('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');
        addLink('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300..900;1,300..900&display=swap');

        const boot = () => {
            // autoStart: enter the interview without a manual "Start" click — the
            // student already confirmed on the review screen. studio.js waits for
            // the agent check + SDK, then runs enterStudio itself.
            // onRestart: "New interview" on the debrief clears the avatar session
            // (so /live won't re-launch the studio) and goes to create-interview.
            try {
                initStudio({
                    autoStart: true,
                    onRestart: () => {
                        clearAvatarSession();
                        navigate('/create-interview');
                    },
                });
            } catch (err) { console.error('initStudio failed:', err); }

            // studio.js has just populated the avatar appearance lists; apply the
            // interviewer/voice/style + toggles chosen on the review screen (or the
            // admin's config). Defensive — only set what the session actually carries.
            const setSel = (id, val) => {
                const el = document.getElementById(id);
                if (!el || val == null || val === '') return;
                if (![...el.options].some((o) => o.value === String(val))) return;
                el.value = String(val);
            };
            if (s.character) {
                const charSel = document.getElementById('f-character');
                if (charSel) {
                    setSel('f-character', s.character);
                    // rebuild valid styles + lock voices to the chosen interviewer
                    charSel.dispatchEvent(new Event('change'));
                }
            }
            setSel('f-style', s.style);
            setSel('f-voice', s.voice);
            const webcam = document.getElementById('f-webcam');
            if (webcam && typeof s.webcam === 'boolean') webcam.checked = s.webcam;
            const aiBox = document.getElementById('f-ai');
            if (aiBox && typeof s.ai === 'boolean' && !aiBox.disabled) aiBox.checked = s.ai;
        };

        // The SDK only has to exist by the time the user clicks Start, but load it
        // now. initStudio itself doesn't need it, so boot immediately after.
        if (!window.SpeechSDK && !document.getElementById('azure-speech-sdk')) {
            const script = document.createElement('script');
            script.id = 'azure-speech-sdk';
            script.src = SDK_SRC;
            script.async = true;
            script.onerror = () => { window.__sdkLoadFailed = true; };
            document.head.appendChild(script);
        }
        boot();

        return () => {
            // Remove the page-scoped stylesheets so they don't affect other routes.
            injected.forEach((n) => n.remove());
            // Best-effort: leave fullscreen if the studio entered it.
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {/* ============================ SETUP ============================
                No card — the student already confirmed on the review screen, so the
                studio auto-starts (studio.js autoStart). This screen only shows a
                brief "preparing" state (and surfaces any setup error) before it
                transitions to the studio; the form + controls below stay hidden but
                present because studio.js reads them by id. */}
            <section id="screen-setup" className="screen is-active">
                <div style={{ minHeight: '100vh', background: '#fff', display: 'grid', placeItems: 'center', padding: '24px' }}>
                    <form id="setup-form" className="setup-card" autoComplete="off" style={{ maxWidth: '420px', textAlign: 'center' }}>
                        <div className="brand" style={{ marginBottom: '28px', justifyContent: 'center' }}><i className="bx bx-conversation"></i> GLAMIS</div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
                            <span className="loader-ring"></span>
                            <h2 className="form-title" style={{ margin: 0 }}>Preparing your interview…</h2>
                        </div>
                        <p className="setup-status" id="setup-status">Camera &amp; microphone access is requested as it starts.</p>

                        {/* Hidden controls — studio.js reads these by id at Start. The
                            content fields are React-controlled from the session config;
                            avatar appearance/toggles are populated by studio.js and then
                            set from the session in boot() above. */}
                        <div style={{ display: 'none' }} aria-hidden="true">
                            <input id="f-name" type="text" value={form.name} readOnly />
                            <input id="f-role" type="text" value={form.role} readOnly />
                            <select id="f-experience" value={form.experience} onChange={upd('experience')}>
                                <option value="Fresher">Fresher</option>
                                <option value="0-2 years">0–2 years</option>
                                <option value="3-5 years">3–5 years</option>
                                <option value="5+ years">5+ years</option>
                            </select>
                            <select id="f-type" value={form.type} onChange={upd('type')}>
                                <option value="behavioral">Behavioral / HR</option>
                                <option value="technical">Technical</option>
                                <option value="dsa">Data Structures &amp; Algorithms</option>
                                <option value="system-design">System Design</option>
                                <option value="verbal">Verbal / Communication</option>
                            </select>
                            <select id="f-difficulty" value={form.difficulty} onChange={upd('difficulty')}>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                            <select id="f-count" value={form.count} onChange={upd('count')}>
                                {/* Honor any assigned count (e.g. 1, 2, 10) not in the presets. */}
                                {!['3', '5', '8'].includes(String(form.count)) && (
                                    <option value={String(form.count)}>{form.count} questions</option>
                                )}
                                <option value="3">3 questions</option>
                                <option value="5">5 questions</option>
                                <option value="8">8 questions</option>
                            </select>
                            <select id="f-voice"></select>
                            <select id="f-character"></select>
                            <select id="f-style"></select>
                            <input id="f-webcam" type="checkbox" defaultChecked />
                            <input id="f-ai" type="checkbox" />
                            <em id="ai-availability"></em>
                            {/* studio.js references #btn-enter (and the form submit) even
                                though autoStart enters the studio directly — keep it present. */}
                            <button type="submit" id="btn-enter" tabIndex={-1}>Start</button>
                        </div>
                    </form>
                </div>
            </section>

            {/* ============================ STUDIO ============================ */}
            <section id="screen-studio" className="screen">
                <header className="studio-bar">
                    <div className="bar-left">
                        <span className="brand sm"><i className="bx bx-conversation"></i> GLAMIS</span>
                        <span className="onair" id="onair"><i className="bx bx-broadcast"></i> Live</span>
                        <span className="chip" id="studio-type">Behavioral</span>
                        <span className="chip proctor-chip" id="proctor-chip" hidden><i className="bx bx-shield-quarter"></i> Proctored</span>
                    </div>
                    <div className="bar-center">
                        <div className="progress-count" id="studio-progress">Introduction</div>
                        <div className="progress-track"><div className="progress-fill" id="progress-bar"></div></div>
                    </div>
                    <div className="bar-right">
                        <span className="timer"><i className="bx bx-time-five"></i> <span id="studio-timer">00:00</span></span>
                    </div>
                </header>

                <main className="studio-main">
                    <div className="stage">
                        <video id="avatar-video" autoPlay playsInline></video>
                        <div className="stage-empty" id="stage-empty">
                            <span className="loader-ring"></span> Connecting to the interviewer…
                        </div>
                        <div className="stage-status" id="stage-status"><span className="status-pip"></span><span id="stage-status-text">Standing by</span></div>
                        <div className="caption" id="caption" hidden>
                            <span className="caption-tag">INTERVIEWER</span>
                            <p id="caption-text"></p>
                        </div>
                    </div>

                    <aside className="candidate">
                        <div className="self-wrap" id="self-wrap">
                            <video id="self-video" autoPlay playsInline muted></video>
                            <div className="self-tag">You</div>
                            <div className="mic-meter" id="mic-meter" aria-hidden="true"></div>
                        </div>
                        <div className="answer-block">
                            <div className="answer-head">
                                <span className="answer-tag">Your answer</span>
                                <span className="rec-state" id="rec-state">Idle</span>
                            </div>
                            <div className="transcript" id="transcript">
                                <p className="transcript-final" id="transcript-final"></p>
                                <p className="transcript-interim" id="transcript-interim"></p>
                                <p className="transcript-hint" id="transcript-hint">When the interviewer finishes, just start talking.</p>
                            </div>
                        </div>
                    </aside>
                </main>

                <footer className="controls">
                    <button className="btn btn-ghost" id="btn-repeat" disabled><i className="bx bx-revision"></i> Repeat</button>
                    <button className="btn btn-ghost" id="btn-rerecord" disabled><i className="bx bx-microphone"></i> Re-record</button>
                    <button className="btn btn-primary" id="btn-submit" disabled>Submit &amp; continue <i className="bx bx-right-arrow-alt"></i></button>
                    <button className="btn btn-ghost" id="btn-skip" disabled>Skip</button>
                    <button className="btn btn-danger" id="btn-end"><i className="bx bx-stop-circle"></i> End interview</button>
                </footer>
                <div className="toast" id="studio-toast" hidden></div>
            </section>

            {/* ============================ DEBRIEF ============================ */}
            <section id="screen-debrief" className="screen">
                <div className="debrief-wrap">
                    <div className="debrief-head">
                        <div className="brand"><i className="bx bx-conversation"></i> GLAMIS</div>
                        <h1 className="display" id="debrief-title">Your report</h1>
                        <p className="lede" id="debrief-meta"></p>
                    </div>

                    <div className="stat-strip" id="overall-stats"></div>

                    <div className="ai-summary" id="ai-summary" hidden></div>

                    <h3 className="section-label">Question by question</h3>
                    <div className="qa-list" id="qa-list"></div>

                    <div className="debrief-actions">
                        <button className="btn btn-ghost" id="btn-download"><i className="bx bx-download"></i> Download transcript</button>
                        <button className="btn btn-primary" id="btn-restart">New interview</button>
                    </div>
                </div>
            </section>

            {/* ===================== END-INTERVIEW CONFIRM =====================
                In-page confirmation (reuses the lock-card styling) shown by
                studio.js instead of window.confirm() — a native dialog would exit
                full screen and trip the proctor lock. */}
            <div className="lock-overlay" id="end-overlay" hidden style={{ zIndex: 10000 }}>
                <div className="lock-card">
                    <i className="bx bx-help-circle lock-icon"></i>
                    <h2>End the interview?</h2>
                    <p>This finishes the interview now and takes you to your debrief. You can't resume after this.</p>
                    <button type="button" className="btn btn-danger" id="end-confirm">
                        <i className="bx bx-stop-circle"></i> End &amp; see debrief
                    </button>
                    <button type="button" className="btn btn-ghost" id="end-cancel" style={{ marginTop: '10px' }}>
                        Continue interview
                    </button>
                </div>
            </div>

            {/* ===================== PROCTOR LOCK OVERLAY ===================== */}
            <div className="lock-overlay" id="lock-overlay" hidden>
                <div className="lock-card">
                    <i className="bx bx-lock-alt lock-icon"></i>
                    <h2 id="lock-title">Interview locked</h2>
                    <p id="lock-msg">You left full-screen mode. The interview must stay in full screen.</p>
                    <button type="button" className="btn btn-primary" id="lock-resume">
                        <i className="bx bx-expand"></i> Resume in full screen
                    </button>
                    <p className="lock-note" id="lock-note"></p>
                </div>
            </div>
        </>
    );
}
