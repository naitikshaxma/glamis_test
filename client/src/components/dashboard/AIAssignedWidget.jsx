import React, { useEffect, useState } from 'react';
import { bearerInstance } from '../../helpers/instance.js';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';

const PRIORITY_COLORS = {
  Critical: { bg: 'bg-red-50',    border: 'border-red-300',    text: 'text-red-700',    badge: 'bg-red-100 text-red-800'    },
  High:     { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800' },
  Medium:   { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
  Low:      { bg: 'bg-blue-50',   border: 'border-blue-300',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-800'   },
};

const STATUS_COLORS = {
  assigned:    'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-gray-200 text-gray-600',
  expired:     'bg-red-100 text-red-800',
};

const TYPE_EMOJI = {
  'DSA Interview':    '💻',
  'DBMS Interview':   '🗄️',
  'OS Interview':     '⚙️',
  'CN Interview':     '🌐',
  'Verbal Interview': '🗣️',
  'HR Interview':     '🤝',
  'Placement Drive':  '🏆',
  'Written Test':     '✍️',
  'Company Mock':     '🏢',
};

const AIAssignedWidget = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [expanded, setExpanded]       = useState(null);
  const [startingId, setStartingId]   = useState(null);
  const navigate = useNavigate();

  const fetchAssignments = async () => {
    try {
      const res = await bearerInstance.get('/api/v1/assignments/my');
      setAssignments(res.data.data?.assignments || []);
    } catch (err) {
      console.warn('AI assignments fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleStart = async (a) => {
    setStartingId(a._id);
    try {
      // 1. Call lazy creation endpoint
      const startRes = await bearerInstance.post('/api/v1/assignments/start', { assignmentId: a._id });
      const { interview } = startRes.data.data;

      // 2. Fetch count and current question details
      const countRes = await bearerInstance.post('/api/v1/interview/interviewQuestion/count', { interviewId: interview._id });
      const questions = countRes.data.data.count;
      const currentQuestion = countRes.data.data.currentQuestion;

      const removeCookies = ['interviewId', 'subject', 'jobTitle', 'selectedCompany', 'adminInterviewId', 'delta', 'verbal', 'svar'];
      const newCookies = {
        interviewId: interview._id,
        adminInterviewId: "",
        delta: questions,
        currentQuestion: currentQuestion
      };

      let url = '';
      let redirect = '';

      if (interview.type === 'subject') {
        newCookies.subject = interview.description;
        newCookies.mockType = 'subject';
        url = '/api/v1/interview/createInterviewByJDAdmin';
        redirect = '/live';
      } else if (interview.type === 'written') {
        newCookies.subject = interview.description;
        newCookies.mockType = 'written';
        url = '/api/v1/interview/createInterviewByWrittenAdmin';
        redirect = '/written';
      } else if (interview.type === 'company') {
        const titleParts = interview.title.split(" | ");
        newCookies.jobTitle = titleParts[2] || interview.title;
        newCookies.selectedCompany = titleParts[1] || "";
        newCookies.mockType = 'company';
        url = '/api/v1/interview/createInterviewByJDAdmin';
        redirect = '/live';
      } else if (interview.type === 'verbal') {
        newCookies.verbal = true;
        newCookies.mockType = 'verbal';
        url = '/api/v1/interview/createInterviewByVerbalAdmin';
        redirect = '/live';
      } else if (interview.type === 'Svar') {
        newCookies.svar = interview.description;
        newCookies.mockType = 'svar';
        url = '/api/v1/interview/createInterviewBySvarAdmin';
        redirect = '/live';
      }

      removeCookies.forEach(cookie => Cookies.remove(cookie));
      Object.entries(newCookies).forEach(([key, value]) => Cookies.set(key, value));
      localStorage.setItem('jd', interview.description);

      // 3. Navigate to system check
      navigate(`/system-check?url=${encodeURIComponent(url)}&redirect=${encodeURIComponent(redirect)}&id=${encodeURIComponent(interview._id)}`);
    } catch (err) {
      console.error('Failed to start assignment:', err);
      alert(err.response?.data?.message || err.message || 'Failed to start interview');
    } finally {
      setStartingId(null);
    }
  };

  if (loading) return (
    <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-5 animate-pulse">
      <div className="h-4 bg-purple-200/50 rounded w-48 mb-3"></div>
      <div className="h-20 bg-purple-100/50 rounded-xl"></div>
    </div>
  );

  if (assignments.length === 0) return null;

  const active    = assignments.filter(a => a.status !== 'completed');
  const completed = assignments.filter(a => a.status === 'completed');

  return (
    <div className="rounded-2xl border border-purple-200 bg-white shadow-sm overflow-hidden m-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-500 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <h3 className="text-white font-bold text-sm">AI Assigned Interviews</h3>
            <p className="text-purple-200 text-xs">{active.length} pending · {completed.length} done</p>
          </div>
        </div>
        <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {assignments.length} total
        </span>
      </div>

      {/* Assignment list */}
      <div className="divide-y divide-gray-100">
        {assignments.map((a) => {
          const colors  = PRIORITY_COLORS[a.priority] || PRIORITY_COLORS.Medium;
          const isOpen  = expanded === a._id;
          const isActive = a.status !== 'completed' && a.status !== 'expired';

          return (
            <div
              key={a._id}
              className={`px-5 py-4 transition-colors ${isActive ? 'hover:bg-gray-50/70' : 'opacity-60'}`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Left: icon + info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${colors.bg} border ${colors.border}`}>
                    {TYPE_EMOJI[a.assignmentType] || '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                      <span className="text-sm font-bold text-gray-800 truncate">{a.assignmentType}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${colors.badge}`}>{a.priority}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-600'}`}>
                        {a.status?.replace('_', ' ')}
                      </span>
                    </div>
                    {/* Collapse/expand rationale */}
                    <p
                      className={`text-xs text-gray-500 cursor-pointer leading-relaxed ${isOpen ? '' : 'line-clamp-1'}`}
                      onClick={() => setExpanded(isOpen ? null : a._id)}
                    >
                      {a.reasoning || 'AI-recommended interview'}
                    </p>

                    {isOpen && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>⏱ {a.estimatedDurationMinutes}min</span>
                          <span>🎯 {a.difficulty}</span>
                          {a.readinessScore > 0 && <span>📈 {a.readinessScore?.toFixed(1)} readiness</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: action */}
                {isActive && (
                  <button
                    onClick={() => handleStart(a)}
                    disabled={startingId === a._id}
                    className="flex-shrink-0 bg-gradient-to-r from-violet-600 to-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:from-violet-700 hover:to-purple-600 transition-all shadow-sm whitespace-nowrap disabled:opacity-50"
                  >
                    {startingId === a._id ? '⏳ Starting…' : a.status === 'in_progress' ? 'Resume →' : 'Start →'}
                  </button>
                )}
                {a.status === 'completed' && (
                  <span className="flex-shrink-0 text-green-600 text-xs font-semibold">✅ Done</span>
                )}
                {a.status === 'expired' && (
                  <span className="flex-shrink-0 text-red-600 text-xs font-semibold">⏰ Expired</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100">
        <Link to="/myInterview" className="text-xs text-purple-600 font-semibold hover:text-purple-800 transition-colors">
          View all my interviews →
        </Link>
      </div>
    </div>
  );
};

export default AIAssignedWidget;
