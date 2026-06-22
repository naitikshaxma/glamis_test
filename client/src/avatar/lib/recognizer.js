/* SpeechController — continuous speech-to-text for the candidate's spoken
   answers, using the same Azure Speech resource via the browser SDK.

   To avoid opening the microphone twice (which garbles recognition), it feeds a
   single shared 16 kHz audio graph to the SDK as a push stream. If no shared
   graph is attached, it falls back to the SDK's own default microphone input.
   SpeechSDK is the global from the CDN script in index.html. */

/* global SpeechSDK */

import { STUDIO } from "../config.js";

export class SpeechController {
    constructor({ onInterim, onFinal } = {}) {
        this.onInterim = onInterim || (() => {});
        this.onFinal = onFinal || (() => {});
        this.recognizer = null;
        this.finalText = "";
        this.running = false;
        this.audio = null;   // { ctx, source } — shared 16 kHz mic graph
        this._nodes = null;  // per-answer Web Audio nodes feeding the push stream
    }

    /** Attach the shared mic graph so STT and the level meter use one stream. */
    attachAudio(audio) { this.audio = audio; }

    _floatTo16(f32) {
        const out = new Int16Array(f32.length);
        for (let i = 0; i < f32.length; i++) {
            const s = Math.max(-1, Math.min(1, f32[i]));
            out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        return out;
    }

    _audioConfig() {
        // Preferred path: push the single shared mic stream to the SDK as 16 kHz
        // mono PCM — matching the SDK's default input format exactly.
        if (this.audio && this.audio.ctx && this.audio.source) {
            const { ctx, source } = this.audio;
            const pushStream = SpeechSDK.AudioInputStream.createPushStream();
            const processor = ctx.createScriptProcessor(4096, 1, 1);
            const sink = ctx.createGain();
            sink.gain.value = 0; // silent: keeps the processor alive without feedback
            processor.onaudioprocess = (e) => {
                if (!this.running) return;
                const f32 = e.inputBuffer.getChannelData(0);
                pushStream.write(this._floatTo16(f32).buffer);
            };
            source.connect(processor);
            processor.connect(sink);
            sink.connect(ctx.destination);
            this._nodes = { processor, sink, pushStream };
            return SpeechSDK.AudioConfig.fromStreamInput(pushStream);
        }
        return SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    }

    _build(token, region) {
        const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);
        speechConfig.speechRecognitionLanguage = STUDIO.RECOGNITION_LANGUAGE;
        const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, this._audioConfig());

        recognizer.recognizing = (s, e) => this.onInterim(e.result.text);
        recognizer.recognized = (s, e) => {
            if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech && e.result.text) {
                this.finalText = (this.finalText + " " + e.result.text).trim();
                this.onFinal(this.finalText);
                this.onInterim("");
            }
        };
        return recognizer;
    }

    /** Start a fresh answer capture (clears prior transcript). */
    start(token, region) {
        if (this.running) return Promise.resolve();
        this.finalText = "";
        this.running = true;
        if (this.audio && this.audio.ctx && this.audio.ctx.resume) this.audio.ctx.resume();
        this.recognizer = this._build(token, region);
        return new Promise((resolve, reject) => {
            this.recognizer.startContinuousRecognitionAsync(resolve, (err) => {
                this.running = false; this._teardownNodes(); reject(err);
            });
        });
    }

    /** Stop capture and return the accumulated final transcript. */
    stop() {
        if (!this.recognizer || !this.running) return Promise.resolve(this.finalText);
        return new Promise((resolve) => {
            const done = () => { this._teardown(); resolve(this.finalText); };
            this.recognizer.stopContinuousRecognitionAsync(done, done);
        });
    }

    _teardownNodes() {
        if (!this._nodes) return;
        try { this._nodes.processor.onaudioprocess = null; } catch (_) {}
        try { this._nodes.processor.disconnect(); } catch (_) {}
        try { this._nodes.sink.disconnect(); } catch (_) {}
        try { this._nodes.pushStream.close(); } catch (_) {}
        this._nodes = null;
    }

    _teardown() {
        this.running = false;
        this._teardownNodes();
        try { this.recognizer.close(); } catch (_) {}
        this.recognizer = null;
    }

    isRunning() { return this.running; }
}
