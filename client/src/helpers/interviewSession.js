import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

// sessionStorage key holding the interview config the student picked on
// /create-interview. The real interview is NOT created until the final Start on
// the review screen, so this carries the selection through the lobby + review.
export const PENDING_INTERVIEW_KEY = 'glamisPendingInterview';

export const getPendingInterview = () => {
    try {
        const raw = sessionStorage.getItem(PENDING_INTERVIEW_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const setPendingInterview = (config) => {
    sessionStorage.setItem(PENDING_INTERVIEW_KEY, JSON.stringify(config));
};

export const clearPendingInterview = () => {
    sessionStorage.removeItem(PENDING_INTERVIEW_KEY);
};

// sessionStorage key for an active real-time avatar interview. When present,
// /live renders the native avatar studio instead of the text interview.
export const AVATAR_SESSION_KEY = 'glamisAvatarSession';

export const getAvatarSession = () => {
    try {
        const raw = sessionStorage.getItem(AVATAR_SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

// Stash the params for a real-time avatar interview, then /live renders the
// native avatar studio. Used by both the self-serve flow (launchInterviewSession)
// and admin-scheduled interviews flagged avatar_enabled (InterviewCard).
export const setAvatarSession = (session) => {
    sessionStorage.setItem(AVATAR_SESSION_KEY, JSON.stringify(session || {}));
};

export const clearAvatarSession = () => {
    sessionStorage.removeItem(AVATAR_SESSION_KEY);
};

// Number of questions for a self-serve interview (LiveInterview reads `delta`).
export const DEFAULT_QUESTION_COUNT = 10;

/**
 * Actually create the interview and launch the live/written session. This is
 * the ONLY place self-serve interview logic runs (it hits the create API which
 * decrements a token + creates the Interview doc), and it is called solely from
 * the final Start on the review screen. Mirrors the original CreateInterview()
 * flow from CreateInterview.jsx so the existing session pages work unchanged.
 *
 * @param {object} config  { interviewType, selectedCompany, selectedJobTitle, subject, topic, resumeText }
 * @param {function} navigate  react-router navigate
 * @returns {Promise<boolean>} true if the session was launched
 */
export async function launchInterviewSession(config, navigate) {
    // Real-time avatar interview: no GLAMIS create call (no token / Interview doc) —
    // the FastAPI agent drives it. Stash the session and let /live render it natively.
    if (config && config.avatarMode) {
        const a = config.avatar || {};
        // Carry the full avatar config (incl. anything edited on the review
        // screen: experience, interviewer/style/voice, webcam, AI) into the
        // session so the /live studio uses exactly what was configured.
        sessionStorage.setItem(AVATAR_SESSION_KEY, JSON.stringify({
            ...a,
            name: Cookies.get('fullName') || '',
        }));
        clearPendingInterview();
        navigate('/live');
        return true;
    }

    // Launching a text interview — drop any stale avatar session so /live
    // renders the text interview, not the avatar studio.
    clearAvatarSession();

    const {
        interviewType,
        selectedCompany,
        selectedJobTitle,
        subject,
        topic,
        resumeText,
    } = config || {};

    const auth = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${Cookies.get('accessToken')}` } };
    const base = import.meta.env.VITE_BACKEND_URL;

    try {
        if (interviewType === 'JD') {
            const response = await axios.post(`${base}/api/v1/interview/createInterviewByJD`, {
                company: selectedCompany,
                jobTitle: selectedJobTitle,
            }, auth);
            if (response.data.statusCode === 200) {
                Cookies.set('interviewId', response.data.data._id);
                Cookies.set('selectedCompany', selectedCompany);
                Cookies.set('jobTitle', selectedJobTitle);
                Cookies.set('mockType', 'student-company');
                Cookies.set('delta', DEFAULT_QUESTION_COUNT);
                Cookies.set('currentQuestion', 0);
                clearPendingInterview();
                navigate('/live');
                return true;
            }
        } else if (interviewType === 'Core Subjects') {
            const response = await axios.post(`${base}/api/v1/interview/createInterview`, {
                subject,
            }, auth);
            if (response.data.statusCode === 200) {
                Cookies.set('interviewId', response.data.data._id);
                Cookies.set('subject', subject);
                Cookies.set('mockType', 'student-subject');
                Cookies.set('delta', DEFAULT_QUESTION_COUNT);
                Cookies.set('currentQuestion', 0);
                clearPendingInterview();
                navigate('/live');
                return true;
            }
        } else if (interviewType === 'Written') {
            const response = await axios.post(`${base}/api/v1/interview/createInterview`, {
                subject: topic,
            }, auth);
            if (response.data.statusCode === 200) {
                Cookies.set('interviewId', response.data.data._id);
                Cookies.set('subject', topic);
                Cookies.set('mockType', 'student-written');
                Cookies.set('delta', DEFAULT_QUESTION_COUNT);
                Cookies.set('currentQuestion', 0);
                clearPendingInterview();
                navigate('/written');
                return true;
            }
        } else if (interviewType === 'Resume') {
            const response = await axios.post(`${base}/api/v1/interview/createInterview`, {
                subject: 'Interview by Resume',
            }, auth);
            if (response.data.statusCode === 200) {
                Cookies.set('interviewId', response.data.data._id);
                Cookies.set('subject', 'Interview by Resume');
                localStorage.setItem('resumeText', resumeText || '');
                Cookies.set('mockType', 'student-resume');
                Cookies.set('delta', DEFAULT_QUESTION_COUNT);
                Cookies.set('currentQuestion', 0);
                clearPendingInterview();
                navigate('/live');
                return true;
            }
        } else {
            toast.error('Unknown interview type. Please start again.');
            return false;
        }
        // statusCode !== 200 but no throw
        toast.error('Failed to start interview. Please try again.');
        return false;
    } catch (error) {
        console.error('Failed to create interview:', error);
        const errMsg = error.response?.data?.message || 'Failed to initiate interview';
        toast.error(errMsg);
        return false;
    }
}
