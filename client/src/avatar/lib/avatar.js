/* AvatarController — wraps the Speech SDK AvatarSynthesizer + WebRTC peer
   connection that streams the interviewer's talking-head video/audio.
   SpeechSDK is the global from the CDN script in index.html. */

/* global SpeechSDK */

export class AvatarController {
    constructor(videoEl) {
        this.videoEl = videoEl;
        this.synth = null;
        this.pc = null;
        this.onConnected = null; // called when first video frame arrives
    }

    /**
     * @param {{token,region,ice,character,style,voice,onEvent}} opts
     */
    async connect(opts) {
        const { token, region, ice, character, style, voice, onEvent } = opts;

        const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);
        speechConfig.speechSynthesisVoiceName = voice;
        this._speechConfig = speechConfig;

        const videoFormat = new SpeechSDK.AvatarVideoFormat();
        const avatarConfig = new SpeechSDK.AvatarConfig(character, style, videoFormat);

        this.synth = new SpeechSDK.AvatarSynthesizer(speechConfig, avatarConfig);
        if (onEvent) {
            this.synth.avatarEventReceived = (s, e) => onEvent(e.description);
        }

        this.pc = new RTCPeerConnection({
            iceServers: [{ urls: ice.Urls, username: ice.Username, credential: ice.Password }],
        });

        this.pc.ontrack = (event) => {
            if (event.track.kind === "video") {
                this.videoEl.srcObject = event.streams[0];
                this.videoEl.onloadeddata = () => this.onConnected && this.onConnected();
            } else if (event.track.kind === "audio") {
                // audio shares the same MediaStream attached to the video element
                this.videoEl.muted = false;
            }
        };
        this.pc.addTransceiver("video", { direction: "sendrecv" });
        this.pc.addTransceiver("audio", { direction: "sendrecv" });

        const result = await this.synth.startAvatarAsync(this.pc);
        if (result.reason === SpeechSDK.ResultReason.Canceled) {
            const c = SpeechSDK.CancellationDetails.fromResult(result);
            throw new Error("Avatar failed to start: " + c.errorDetails);
        }
        return true;
    }

    /** Speak text and resolve when the avatar finishes the utterance. */
    async speak(text) {
        if (!this.synth) return;
        const result = await this.synth.speakTextAsync(text);
        if (result.reason === SpeechSDK.ResultReason.Canceled) {
            const c = SpeechSDK.CancellationDetails.fromResult(result);
            throw new Error("Speak failed: " + c.errorDetails);
        }
    }

    async stopSpeaking() {
        try { await this.synth?.stopSpeakingAsync(); } catch (_) { /* ignore */ }
    }

    refreshToken(token) {
        try { if (this.synth) this.synth.authorizationToken = token; } catch (_) { /* best effort */ }
    }

    close() {
        try { this.synth?.close(); } catch (_) {}
        try { this.pc?.close(); } catch (_) {}
        this.synth = null; this.pc = null;
        if (this.videoEl) this.videoEl.srcObject = null;
    }
}
