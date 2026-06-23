import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { Card, Typography, Button } from '@material-tailwind/react';

// ─── Constants ────────────────────────────────────────────────────────────

const API = import.meta.env.VITE_BACKEND_URL;
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${Cookies.get('accessTokenAdmin')}`,
});

const PRIORITY_STYLES = {
  Critical: 'bg-red-100 text-red-800 border-red-300',
  High:     'bg-orange-100 text-orange-800 border-orange-300',
  Medium:   'bg-yellow-100 text-yellow-800 border-yellow-300',
  Low:      'bg-blue-100 text-blue-800 border-blue-300',
};

const STATUS_STYLES = {
  recommended: 'bg-purple-100 text-purple-700',
  assigned:    'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-gray-100 text-gray-700',
  cancelled:   'bg-red-100 text-red-700',
  expired:     'bg-orange-100 text-orange-700',
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

// ─── Sub-components ───────────────────────────────────────────────────────

const PriorityBadge = ({ priority }) => (
  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[priority] || 'bg-gray-100'}`}>
    {priority}
  </span>
);

const StatusPill = ({ status }) => (
  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[status] || 'bg-gray-100'}`}>
    {status?.replace('_', ' ')}
  </span>
);

const StatCard = ({ label, value, color }) => (
  <div className={`rounded-xl p-4 ${color} flex flex-col gap-1`}>
    <span className="text-2xl font-bold">{value ?? '—'}</span>
    <span className="text-xs font-medium opacity-80">{label}</span>
  </div>
);

// ─── Generate Panel ───────────────────────────────────────────────────────

const GeneratePanel = ({ onGenerated }) => {
  const [userId, setUserId]           = useState('');
  const [jdScore, setJdScore]         = useState('');
  const [company, setCompany]         = useState('');
  const [loading, setLoading]         = useState(false);

  const handleGenerate = async () => {
    if (!userId.trim()) { toast.error('Please enter a User ID'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/v1/admin/assignments/generate`,
        { userId: userId.trim(), jdMatchScore: jdScore ? parseFloat(jdScore) : undefined, targetCompany: company || undefined },
        { headers: authHeaders() }
      );
      toast.success(res.data.message || 'Recommendations generated!');
      onGenerated();
      setUserId('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🤖</span>
        <Typography variant="h6" className="font-bold text-gray-800">Generate AI Recommendations</Typography>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Student User ID *</label>
          <input
            value={userId}
            onChange={e => setUserId(e.target.value)}
            placeholder="MongoDB ObjectId or mock_high"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">JD Match Score (0-10)</label>
          <input
            type="number" min="0" max="10" step="0.1"
            value={jdScore}
            onChange={e => setJdScore(e.target.value)}
            placeholder="Optional"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Target Company</label>
          <input
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="Google, Amazon…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      </div>
      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-gradient-to-r from-green-700 to-green-500 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow hover:shadow-md transition-all"
      >
        {loading ? '⏳ Generating…' : '⚡ Generate Recommendations'}
      </Button>
    </Card>
  );
};

// ─── Filters ──────────────────────────────────────────────────────────────

const Filters = ({ filters, setFilters }) => (
  <div className="flex flex-wrap gap-3">
    {[
      { key: 'status', label: 'Status', options: ['', 'recommended', 'assigned', 'in_progress', 'completed', 'cancelled'] },
      { key: 'priority', label: 'Priority', options: ['', 'Critical', 'High', 'Medium', 'Low'] },
      { key: 'assignmentType', label: 'Type', options: ['', 'DSA Interview', 'DBMS Interview', 'OS Interview', 'CN Interview', 'Verbal Interview', 'HR Interview', 'Written Test', 'Company Mock', 'Placement Drive'] },
    ].map(({ key, label, options }) => (
      <div key={key} className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
        <select
          value={filters[key] || ''}
          onChange={e => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {options.map(o => <option key={o} value={o}>{o || `All ${label}s`}</option>)}
        </select>
      </div>
    ))}
  </div>
);

// ─── Assignment Card ──────────────────────────────────────────────────────

const AssignmentCard = ({ assignment, onApprove, onReject, approving, rejecting }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject]     = useState(false);

  return (
    <Card className="p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{TYPE_EMOJI[assignment.assignmentType] || '📋'}</span>
          <div>
            <Typography variant="small" className="font-bold text-gray-800">{assignment.assignmentType}</Typography>
            <Typography variant="small" className="text-gray-500 text-xs">
              {assignment.userId?.name || '—'} · {assignment.userId?.email_id || ''}
            </Typography>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={assignment.priority} />
          <StatusPill status={assignment.status} />
        </div>
      </div>

      {/* Metrics row */}
      <div className="flex gap-4 mb-3">
        <div className="text-xs text-gray-500"><span className="font-semibold text-gray-700">{assignment.readinessScore?.toFixed(1)}</span> readiness</div>
        <div className="text-xs text-gray-500"><span className="font-semibold text-gray-700">{assignment.estimatedDurationMinutes}min</span> est.</div>
        <div className="text-xs text-gray-500"><span className="font-semibold text-gray-700">{assignment.difficulty}</span> difficulty</div>
      </div>

      {/* Rationale */}
      <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
        <Typography variant="small" className="text-gray-600 text-xs italic leading-relaxed">
          "{assignment.reasoning}"
        </Typography>
      </div>

      {/* Weak subjects */}
      {assignment.weakSubjects?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {assignment.weakSubjects.map(s => (
            <span key={s} className="text-[10px] px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full">{s}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      {assignment.status === 'recommended' && (
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex gap-2">
            <Button
              onClick={() => onApprove(assignment._id)}
              disabled={approving === assignment._id}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded-lg font-semibold transition-colors"
            >
              {approving === assignment._id ? '⏳ Approving…' : '✅ Approve & Publish'}
            </Button>
            <Button
              onClick={() => setShowReject(!showReject)}
              size="sm"
              variant="outlined"
              className="flex-1 border-red-300 text-red-600 text-xs py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors"
            >
              ❌ Reject
            </Button>
          </div>
          {showReject && (
            <div className="flex gap-2">
              <input
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Rejection reason (optional)"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <Button
                onClick={() => { onReject(assignment._id, rejectReason); setShowReject(false); }}
                disabled={rejecting === assignment._id}
                size="sm"
                className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold"
              >
                {rejecting === assignment._id ? '⏳' : 'Confirm'}
              </Button>
            </div>
          )}
        </div>
      )}

      {assignment.status === 'assigned' && (
        <div className="mt-2 text-xs text-green-700 font-medium">
          ✅ Interview auto-created · {assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString() : ''}
        </div>
      )}
    </Card>
  );
};

// ─── Analytics Panel ──────────────────────────────────────────────────────

const AnalyticsPanel = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/v1/admin/assignments/analytics`, { headers: authHeaders() })
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-xs text-gray-400 py-4">Loading analytics…</div>;
  if (!data)   return null;

  return (
    <Card className="p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xl">📊</span>
        <Typography variant="h6" className="font-bold text-gray-800">Assignment Analytics</Typography>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Generated"   value={data.total}                         color="bg-purple-50 text-purple-800" />
        <StatCard label="Approved"          value={data.byStatus?.assigned || 0}       color="bg-green-50 text-green-800" />
        <StatCard label="Completed"         value={data.byStatus?.completed || 0}      color="bg-blue-50 text-blue-800" />
        <StatCard label="Completion Rate"   value={`${data.completionRate}%`}          color="bg-orange-50 text-orange-800" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Typography variant="small" className="font-semibold text-gray-600 mb-3">Top Assigned Types</Typography>
          <div className="space-y-2">
            {(data.topAssignedTypes || []).map(({ type, count }) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{TYPE_EMOJI[type]} {type}</span>
                <span className="text-xs font-bold text-gray-800">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Typography variant="small" className="font-semibold text-gray-600 mb-3">By Priority</Typography>
          <div className="space-y-2">
            {Object.entries(data.byPriority || {}).map(([p, c]) => (
              <div key={p} className="flex items-center justify-between">
                <PriorityBadge priority={p} />
                <span className="text-xs font-bold text-gray-800">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {data.placementEligibleCount > 0 && (
        <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <Typography variant="small" className="font-bold text-green-800">
              {data.placementEligibleCount} student{data.placementEligibleCount > 1 ? 's' : ''} placement-eligible
            </Typography>
            <Typography variant="small" className="text-green-600 text-xs">Ready for Placement Drive</Typography>
          </div>
        </div>
      )}
    </Card>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────

const AIAssignmentCenter = () => {
  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination]   = useState({ total: 0, page: 1, pages: 1 });
  const [filters, setFilters]         = useState({});
  const [loading, setLoading]         = useState(false);
  const [approving, setApproving]     = useState(null);
  const [rejecting, setRejecting]     = useState(null);
  const [tab, setTab]                 = useState('recommendations'); // 'recommendations' | 'analytics'
  const [bulkSelected, setBulkSelected] = useState([]);

  const fetchAssignments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const res = await axios.get(`${API}/api/v1/admin/assignments`, { headers: authHeaders(), params });
      setAssignments(res.data.data?.assignments || []);
      setPagination({ total: res.data.data?.total, page: res.data.data?.page, pages: res.data.data?.pages });
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchAssignments(1); }, [fetchAssignments]);

  const handleApprove = async (id) => {
    setApproving(id);
    try {
      await axios.post(`${API}/api/v1/admin/assignments/approve`, { assignmentId: id }, { headers: authHeaders() });
      toast.success('✅ Assignment approved — interview created!');
      fetchAssignments(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (id, reason) => {
    setRejecting(id);
    try {
      await axios.post(`${API}/api/v1/admin/assignments/reject`, { assignmentId: id, reason }, { headers: authHeaders() });
      toast.success('Recommendation rejected');
      fetchAssignments(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    } finally {
      setRejecting(null);
    }
  };

  const handleBulkApprove = async () => {
    if (bulkSelected.length === 0) { toast.error('No recommendations selected'); return; }
    for (const id of bulkSelected) await handleApprove(id);
    setBulkSelected([]);
  };

  const toggleBulkSelect = (id) => {
    setBulkSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const recommended = assignments.filter(a => a.status === 'recommended');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 to-purple-500 rounded-2xl p-8 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🤖</span>
              <Typography variant="h4" className="font-bold">AI Assignment Center</Typography>
            </div>
            <Typography variant="paragraph" className="opacity-80">
              Generate AI-powered interview recommendations and publish them with one click.
            </Typography>
          </div>
          <div className="hidden md:flex flex-col items-end gap-1">
            <span className="text-sm opacity-70">{pagination.total} total assignments</span>
            <span className="text-sm font-semibold">{recommended.length} pending review</span>
          </div>
        </div>
      </div>

      {/* Generate Panel */}
      <div className="mb-6">
        <GeneratePanel onGenerated={() => fetchAssignments(1)} />
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-4">
        {['recommendations', 'analytics'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t ? 'bg-purple-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {t === 'recommendations' ? '📋 Recommendations' : '📊 Analytics'}
          </button>
        ))}
      </div>

      {tab === 'analytics' && <AnalyticsPanel />}

      {tab === 'recommendations' && (
        <>
          {/* Filters + Bulk actions */}
          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <Filters filters={filters} setFilters={setFilters} />
            {bulkSelected.length > 0 && (
              <Button
                onClick={handleBulkApprove}
                className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
              >
                ✅ Bulk Approve ({bulkSelected.length})
              </Button>
            )}
          </div>

          {/* Cards */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <span className="text-6xl mb-4">🤖</span>
              <Typography variant="h6" className="text-gray-400 font-medium">No assignments yet</Typography>
              <Typography variant="small" className="text-gray-300 mt-1">Generate recommendations using the panel above</Typography>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {assignments.map(a => (
                <div key={a._id} className="relative">
                  {a.status === 'recommended' && (
                    <input
                      type="checkbox"
                      checked={bulkSelected.includes(a._id)}
                      onChange={() => toggleBulkSelect(a._id)}
                      className="absolute top-3 right-3 z-10 w-4 h-4 accent-purple-600 cursor-pointer"
                      title="Select for bulk approve"
                    />
                  )}
                  <AssignmentCard
                    assignment={a}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    approving={approving}
                    rejecting={rejecting}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => fetchAssignments(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >← Prev</button>
              <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.pages}</span>
              <button
                onClick={() => fetchAssignments(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AIAssignmentCenter;
