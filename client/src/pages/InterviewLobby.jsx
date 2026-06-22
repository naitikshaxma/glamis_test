import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/global_components/MainLayout';
import Dashboard from './dashboards/Dashboard.jsx';
import FullscreenGuard from '../components/FullscreenGuard';
import { getPendingInterview, clearPendingInterview } from '../helpers/interviewSession';

// Step 1 of the pre-interview flow: a locked, fullscreen lobby that renders the
// student portal in "scheduled" mode — the dashboard's My Interviews grid is
// replaced by the Recently Scheduled Interview card (Statistics, Leaderboard and
// Activity stay). No interview logic runs here — Start moves to the review screen.
export default function InterviewLobby() {
    const navigate = useNavigate();
    const pending = getPendingInterview();

    // Guard direct access — there must be a scheduled (pending) interview.
    useEffect(() => {
        if (!pending) navigate('/create-interview', { replace: true });
    }, [pending, navigate]);

    if (!pending) return null;

    // Deliberate exit from the locked flow: drop the scheduled config, leave
    // fullscreen, and return to the normal dashboard.
    const exitLobby = () => {
        clearPendingInterview();
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        }
        navigate('/dashboard');
    };

    return (
        <FullscreenGuard
            title="Fullscreen required"
            message="You are about to begin a proctored mock interview. Return to fullscreen to continue."
        >
            <MainLayout locked>
                <Dashboard
                    scheduled={pending}
                    onStart={() => navigate('/interview/review')}
                    onExit={exitLobby}
                />
            </MainLayout>
        </FullscreenGuard>
    );
}
