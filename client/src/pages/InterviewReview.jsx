import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import FullscreenGuard from '../components/FullscreenGuard';
import InterviewSettingsDialog from '../components/InterviewSettingsDialog';
import {
    getPendingInterview,
    setPendingInterview,
    launchInterviewSession,
    DEFAULT_QUESTION_COUNT,
} from '../helpers/interviewSession';

// Step 2 of the pre-interview flow: review the selected configuration. The
// final "Start Interview" here is the ONLY place the interview is actually
// created (token spent) and the live/written session launched. For avatar
// interviews this screen also hosts the "Modify settings" editor.
export default function InterviewReview() {
    const navigate = useNavigate();
    const [starting, setStarting] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [pending, setPending] = useState(getPendingInterview);

    useEffect(() => {
        if (!pending) navigate('/create-interview', { replace: true });
    }, [pending, navigate]);

    // Persist the avatar settings edited in the dialog back into the pending
    // config (state drives the rows; sessionStorage carries it to /live).
    const handleSaveSettings = (avatar) => {
        const next = { ...pending, avatar: { ...(pending.avatar || {}), ...avatar } };
        setPending(next);
        setPendingInterview(next);
    };

    const rows = useMemo(() => {
        if (!pending) return [];
        const { interviewType, selectedCompany, selectedJobTitle, subject, topic, resumeText } = pending;
        const out = [['Interview type', typeLabel(interviewType)]];
        if (interviewType === 'JD') {
            out.push(['Role', selectedJobTitle || '—']);
            out.push(['Company', selectedCompany || '—']);
        } else if (interviewType === 'Core Subjects') {
            out.push(['Subject', subject || '—']);
        } else if (interviewType === 'Written') {
            out.push(['Topic', topic || '—']);
        } else if (interviewType === 'Resume') {
            out.push(['Source', resumeText ? 'Your resume (parsed)' : 'No resume text']);
        }
        if (pending.avatarMode) {
            const a = pending.avatar || {};
            out.push(['Difficulty', (a.difficulty || 'medium').replace(/^\w/, (c) => c.toUpperCase())]);
            out.push(['Questions', String(a.count ?? DEFAULT_QUESTION_COUNT)]);
            out.push(['Mode', 'Real-time Avatar Interview']);
        } else {
            out.push(['Difficulty', 'Medium']);
            out.push(['Questions', String(DEFAULT_QUESTION_COUNT)]);
        }
        return out;
    }, [pending]);

    if (!pending) return null;

    const handleStart = async () => {
        setStarting(true);
        const ok = await launchInterviewSession(pending, navigate);
        if (!ok) setStarting(false); // stay on review so the student can retry
    };

    return (
        <FullscreenGuard
            title="Fullscreen required"
            message="You are about to begin a proctored mock interview. Return to fullscreen to continue."
        >
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-6">
                <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#2b6030] text-white px-8 py-6">
                        <h1 className="text-2xl font-bold">Review your mock interview</h1>
                        <p className="text-white/80 text-sm mt-1">
                            Confirm the details below. Your interview starts the moment you press Start.
                        </p>
                    </div>

                    {/* Config rows */}
                    <div className="px-8 py-6">
                        <dl className="divide-y divide-gray-100">
                            {rows.map(([label, value]) => (
                                <div key={label} className="flex items-center justify-between py-3">
                                    <dt className="text-sm font-medium text-gray-500">{label}</dt>
                                    <dd className="text-sm font-semibold text-gray-800 text-right max-w-[60%] truncate" title={value}>
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>

                        <div className="mt-6 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#b45309" className="h-5 w-5 shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                            <p className="text-xs text-amber-800">
                                Stay in fullscreen and don't switch tabs once you start — your activity is monitored and affects your score.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-8 pb-8 flex items-center justify-between gap-3">
                        <div>
                            {pending.avatarMode && (
                                <button
                                    onClick={() => setShowSettings(true)}
                                    disabled={starting}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 focus:outline-none"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                    Modify settings
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/interview/lobby')}
                                disabled={starting}
                                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 focus:outline-none"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleStart}
                                disabled={starting}
                                className="px-6 py-2.5 rounded-lg bg-[#2b6030] hover:bg-[#1c3d1f] text-white font-semibold transition-colors disabled:opacity-60 focus:outline-none"
                            >
                                {starting ? 'Starting…' : 'Start'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {pending.avatarMode && (
                <InterviewSettingsDialog
                    open={showSettings}
                    name={Cookies.get('fullName') || 'Candidate'}
                    initial={pending.avatar || {}}
                    onClose={() => setShowSettings(false)}
                    onSave={handleSaveSettings}
                />
            )}
        </FullscreenGuard>
    );
}

function typeLabel(t) {
    switch (t) {
        case 'JD': return 'Interview by Job Description';
        case 'Core Subjects': return 'Interview by Core Subjects';
        case 'Written': return 'Writing Skills Practice';
        case 'Resume': return 'Interview by Resume';
        default: return t || '—';
    }
}
