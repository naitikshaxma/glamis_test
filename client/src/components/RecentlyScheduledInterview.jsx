import React from 'react';
import { DEFAULT_QUESTION_COUNT } from '../helpers/interviewSession';

// Card shown in the pre-interview lobby in place of the dashboard's
// "My Interviews" grid — it surfaces the interview the student just scheduled
// and is the entry point to the review/start step.

function typeLabel(t) {
    switch (t) {
        case 'JD': return 'Interview by Job Description';
        case 'Core Subjects': return 'Interview by Core Subjects';
        case 'Written': return 'Writing Skills Practice';
        case 'Resume': return 'Interview by Resume';
        default: return t || 'Mock Interview';
    }
}

function summary(p) {
    if (!p) return '';
    if (p.interviewType === 'JD') return [p.selectedJobTitle, p.selectedCompany].filter(Boolean).join(' @ ') || '—';
    if (p.interviewType === 'Core Subjects') return p.subject || '—';
    if (p.interviewType === 'Written') return p.topic || '—';
    if (p.interviewType === 'Resume') return p.resumeText ? 'Based on your resume' : '—';
    return '—';
}

export default function RecentlyScheduledInterview({ pending, onStart, onExit }) {
    if (!pending) return null;

    const isAvatar = !!pending.avatarMode;
    const av = pending.avatar || {};
    const difficulty = (isAvatar ? (av.difficulty || 'medium') : 'medium').replace(/^\w/, (c) => c.toUpperCase());
    const questionCount = isAvatar ? (av.count ?? DEFAULT_QUESTION_COUNT) : DEFAULT_QUESTION_COUNT;

    return (
        <section className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Recently Scheduled Interview</h2>

            <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl relative shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
                {/* Background abstract elements */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/5 rounded-full filter blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full filter blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex items-start gap-5">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2b6030]/10">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="#2b6030" className="h-7 w-7">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                            </svg>
                        </span>
                        <div className="min-w-0">
                            <p className="text-xl font-bold text-slate-800 leading-tight">{typeLabel(pending.interviewType)}</p>
                            <p className="text-sm text-slate-500 mt-1 truncate" title={summary(pending)}>{summary(pending)}</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">Difficulty: {difficulty}</span>
                                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">{questionCount} questions</span>
                                {isAvatar && (
                                    <span className="text-[11px] font-semibold text-[#2b6030] bg-[#2b6030]/10 border border-[#2b6030]/20 rounded-full px-3 py-1">Real-time Avatar</span>
                                )}
                                <span className="text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">Scheduled</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-5">
                        You're in a proctored, fullscreen session. Review your setup and begin when you're ready —
                        the interview starts the moment you press Start.
                    </p>

                    <div className="flex justify-end gap-3">
                        {onExit && (
                            <button
                                onClick={onExit}
                                className="text-slate-600 hover:text-slate-800 font-semibold px-5 py-3 rounded-full border border-slate-300 hover:bg-slate-50 transition-colors focus:outline-none"
                            >
                                Exit
                            </button>
                        )}
                        <button
                            onClick={onStart}
                            className="bg-[#2b6030] hover:bg-[#1f4723] text-white font-bold px-7 py-3 rounded-full transition-all duration-300 shadow-[0_4px_14px_rgba(43,96,48,0.25)] hover:shadow-[0_6px_20px_rgba(43,96,48,0.35)] hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
                        >
                            Start Interview
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
