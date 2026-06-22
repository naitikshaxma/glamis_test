import React, { useEffect, useState } from 'react';
import { STUDIO } from '../avatar/config.js';

/* Avatar interview settings editor, shown from the pre-interview Review screen
   (it replaces the old "Modify settings" popup that used to live on the /live
   avatar setup card). Fully React-controlled and styled with Tailwind to match
   the client; the avatar appearance options come from the shared avatar config.
   Name + target role are read-only (name from the account, role from the
   scheduled interview). On Done it returns the full settings object. */

const TYPES = [
    ['behavioral', 'Behavioral / HR'],
    ['technical', 'Technical'],
    ['dsa', 'Data Structures & Algorithms'],
    ['system-design', 'System Design'],
    ['verbal', 'Verbal / Communication'],
];
const EXPERIENCES = ['Fresher', '0-2 years', '3-5 years', '5+ years'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const COUNTS = ['3', '5', '8'];

const fieldCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 bg-white focus:border-[#2b6030] focus:ring-1 focus:ring-[#2b6030] outline-none';
const lockedCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed outline-none';
const lblCls = 'block text-xs font-semibold text-gray-600 mb-1';

export default function InterviewSettingsDialog({ open, name, initial, onClose, onSave }) {
    const a = initial || {};
    const [experience, setExperience] = useState('0-2 years');
    const [type, setType] = useState('technical');
    const [difficulty, setDifficulty] = useState('medium');
    const [count, setCount] = useState('5');
    const [character, setCharacter] = useState(STUDIO.DEFAULTS.character);
    const [style, setStyle] = useState(STUDIO.DEFAULTS.style);
    const [voice, setVoice] = useState(STUDIO.DEFAULTS.voice);
    const [webcam, setWebcam] = useState(true);
    const [ai, setAi] = useState(true);

    // (Re)seed from the current config every time the dialog opens.
    useEffect(() => {
        if (!open) return;
        setExperience(a.experience || '0-2 years');
        setType(a.type || 'technical');
        setDifficulty(a.difficulty || 'medium');
        setCount(String(a.count ?? 5));
        setCharacter(a.character || STUDIO.DEFAULTS.character);
        setStyle(a.style || STUDIO.DEFAULTS.style);
        setVoice(a.voice || STUDIO.DEFAULTS.voice);
        setWebcam(a.webcam !== false);
        setAi(a.ai !== false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    if (!open) return null;

    const role = a.role || '';
    const gender = STUDIO.AVATARS[character]?.gender || 'female';
    const styles = STUDIO.AVATARS[character]?.styles || [];

    // Changing the interviewer rebuilds valid styles + snaps the voice to the
    // matching gender (mirrors the studio's behavior).
    const onCharacter = (val) => {
        setCharacter(val);
        const av = STUDIO.AVATARS[val];
        if (!av) return;
        if (!av.styles.includes(style)) setStyle(av.styles[0]);
        const cur = STUDIO.VOICES.find((v) => v.id === voice);
        if (!cur || cur.gender !== av.gender) {
            setVoice(STUDIO.DEFAULT_VOICE_BY_GENDER[av.gender] || voice);
        }
    };

    const countOptions = COUNTS.includes(String(count)) ? COUNTS : [String(count), ...COUNTS];

    const save = () => {
        onSave({
            role,
            experience,
            type,
            difficulty,
            count: parseInt(count, 10) || 5,
            character,
            style,
            voice,
            webcam,
            ai,
        });
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
                    <h2 className="text-lg font-bold text-gray-800">Interview settings</h2>
                    <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <div>
                        <label className={lblCls}>Your name <span className="text-gray-400">🔒</span></label>
                        <input value={name || ''} readOnly title="Set from your GLAMIS account — can't be changed." className={lockedCls} />
                    </div>
                    <div>
                        <label className={lblCls}>Target role <span className="text-gray-400">🔒</span></label>
                        <input value={role} readOnly title="Set from your scheduled interview — can't be changed." className={lockedCls} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={lblCls}>Experience</label>
                            <select value={experience} onChange={(e) => setExperience(e.target.value)} className={fieldCls}>
                                {EXPERIENCES.map((x) => (<option key={x} value={x}>{x.replace('-', '–')}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className={lblCls}>Interview type</label>
                            <select value={type} onChange={(e) => setType(e.target.value)} className={fieldCls}>
                                {TYPES.map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={lblCls}>Difficulty</label>
                            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={fieldCls}>
                                {DIFFICULTIES.map((d) => (<option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className={lblCls}>Questions</label>
                            <select value={String(count)} onChange={(e) => setCount(e.target.value)} className={fieldCls}>
                                {countOptions.map((c) => (<option key={c} value={c}>{c} question{Number(c) === 1 ? '' : 's'}</option>))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={lblCls}>Interviewer</label>
                            <select value={character} onChange={(e) => onCharacter(e.target.value)} className={fieldCls}>
                                {Object.entries(STUDIO.AVATARS).map(([id, av]) => (<option key={id} value={id}>{av.label} ({av.gender})</option>))}
                            </select>
                        </div>
                        <div>
                            <label className={lblCls}>Style</label>
                            <select value={style} onChange={(e) => setStyle(e.target.value)} className={fieldCls}>
                                {styles.map((st) => (<option key={st} value={st}>{st.replace(/-/g, ' ')}</option>))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={lblCls}>Voice</label>
                        <select value={voice} onChange={(e) => setVoice(e.target.value)} className={fieldCls}>
                            {STUDIO.VOICES.map((v) => (<option key={v.id} value={v.id} disabled={v.gender !== gender}>{v.label}</option>))}
                        </select>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={webcam} onChange={(e) => setWebcam(e.target.checked)} className="h-4 w-4 accent-[#2b6030]" />
                        <span className="text-sm text-gray-700">Show my webcam</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={ai} onChange={(e) => setAi(e.target.checked)} className="h-4 w-4 accent-[#2b6030]" />
                        <span className="text-sm text-gray-700">AI scoring <span className="text-gray-400 text-xs">(agent-scored)</span></span>
                    </label>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50">Cancel</button>
                    <button onClick={save} className="px-6 py-2 rounded-lg bg-[#2b6030] hover:bg-[#1c3d1f] text-white font-semibold">Done</button>
                </div>
            </div>
        </div>
    );
}
