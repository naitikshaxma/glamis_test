/* Studio configuration: interviewer characters, postures, and voices.
   Character + style pairs below are valid prebuilt avatar combinations. */

export const STUDIO = {
    // Prebuilt avatar characters -> styles VALID FOR THE REAL-TIME API.
    // Per Microsoft docs, Lisa supports only `casual-sitting` in real time
    // (her graceful/technical styles are batch-only). The other characters use
    // plain style names. Jeff is omitted (no real-time styles; retiring 2026).
    AVATARS: {
        lisa:  { label: "Lisa",  gender: "female", styles: ["casual-sitting"] },
        harry: { label: "Harry", gender: "male",   styles: ["business", "casual", "youthful"] },
        lori:  { label: "Lori",  gender: "female", styles: ["casual", "graceful", "formal"] },
        max:   { label: "Max",   gender: "male",   styles: ["business", "casual", "formal"] },
        meg:   { label: "Meg",   gender: "female", styles: ["business", "casual", "formal"] },
    },

    // Neural voices that drive speech + lip-sync. Indian-English first for GLA context.
    VOICES: [
        { id: "en-IN-NeerjaNeural",             gender: "female", label: "Neerja — Indian English, female" },
        { id: "en-IN-PrabhatNeural",            gender: "male",   label: "Prabhat — Indian English, male" },
        { id: "en-US-AvaMultilingualNeural",    gender: "female", label: "Ava — US English, female" },
        { id: "en-US-AndrewMultilingualNeural", gender: "male",   label: "Andrew — US English, male" },
        { id: "en-US-EmmaMultilingualNeural",   gender: "female", label: "Emma — US English, female" },
        { id: "en-GB-SoniaNeural",              gender: "female", label: "Sonia — British English, female" },
    ],

    // When the interviewer changes, the voice auto-switches to this default for the
    // matching gender (the user can still override afterwards).
    DEFAULT_VOICE_BY_GENDER: { female: "en-IN-NeerjaNeural", male: "en-IN-PrabhatNeural" },

    DEFAULTS: { character: "lisa", style: "casual-sitting", voice: "en-IN-NeerjaNeural" },

    RECOGNITION_LANGUAGE: "en-US",

    TYPE_LABELS: {
        behavioral: "Behavioral / HR",
        technical: "Technical",
        dsa: "Data Structures & Algorithms",
        "system-design": "System Design",
        verbal: "Verbal / Communication",
    },
};
