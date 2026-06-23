import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { Card, Typography, Button } from '@material-tailwind/react';

const API = import.meta.env.VITE_BACKEND_URL;
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${Cookies.get('accessTokenAdmin')}`,
});

const StatCard = ({ label, value, color }) => (
  <div className={`rounded-xl p-4 ${color} flex flex-col gap-1 border border-black/5 shadow-sm`}>
    <span className="text-2xl font-bold">{value ?? '—'}</span>
    <span className="text-xs font-semibold opacity-75">{label}</span>
  </div>
);

const AutomationCenter = () => {
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState({
    AUTO_ASSIGNMENTS_ENABLED: false,
    AUTO_ASSIGNMENT_THRESHOLD: 70,
    AUTO_ASSIGNMENT_BATCH_SIZE: 50,
    AUTO_ASSIGNMENT_FREQUENCY: 'daily',
    AUTO_ASSIGNMENT_COOLDOWN_DAYS: 7,
    DEFAULT_EXPIRY_DAYS: 7,
    MAX_ASSIGNMENTS_PER_RUN: 1000,
    MAX_LLM_ASSIGNMENTS_PER_RUN: 250,
    AUTO_NOTIFICATION_ENABLED: true,
    AUTO_REASSESSMENT_ENABLED: true,
  });

  const [reviewQueue, setReviewQueue] = useState([]);
  const [dlq, setDlq] = useState([]);
  const [logs, setLogs] = useState([]);
  
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [submittingSettings, setSubmittingSettings] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);
  
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'review' | 'dlq' | 'logs'

  const fetchData = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [statsRes, settingsRes, logsRes, reviewRes, dlqRes] = await Promise.all([
        axios.get(`${API}/api/v1/admin/assignments/stats`, { headers: authHeaders() }),
        axios.get(`${API}/api/v1/admin/assignments/settings`, { headers: authHeaders() }),
        axios.get(`${API}/api/v1/admin/assignments/logs`, { headers: authHeaders() }),
        axios.get(`${API}/api/v1/admin/assignments/review-queue`, { headers: authHeaders() }),
        axios.get(`${API}/api/v1/admin/assignments/dlq`, { headers: authHeaders() }),
      ]);

      setStats(statsRes.data.data);
      setSettings(settingsRes.data.data);
      setLogs(logsRes.data.data);
      setReviewQueue(reviewRes.data.data);
      setDlq(dlqRes.data.data);
    } catch (err) {
      toast.error('Failed to load automation board data');
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSubmittingSettings(true);
    try {
      await axios.post(`${API}/api/v1/admin/assignments/settings`, settings, { headers: authHeaders() });
      toast.success('Configuration saved successfully!');
      fetchData();
    } catch (err) {
      toast.error('Failed to update configurations');
    } finally {
      setSubmittingSettings(false);
    }
  };

  const handleTriggerManualRun = async () => {
    setTriggering(true);
    try {
      const res = await axios.post(`${API}/api/v1/admin/assignments/trigger`, {}, { headers: authHeaders() });
      toast.success(res.data.message || 'Scheduler manual execution started!');
      fetchData();
    } catch (err) {
      toast.error('Manual execution failed');
    } finally {
      setTriggering(false);
    }
  };

  const handleResolveReview = async (id, action) => {
    setResolvingId(id);
    try {
      await axios.post(`${API}/api/v1/admin/assignments/review-queue/resolve`, 
        { id, action }, 
        { headers: authHeaders() }
      );
      toast.success(`Recommendation successfully ${action}d!`);
      fetchData();
    } catch (err) {
      toast.error('Failed to resolve recommendation');
    } finally {
      setResolvingId(null);
    }
  };

  const handleResolveDlq = async (id) => {
    setResolvingId(id);
    try {
      await axios.post(`${API}/api/v1/admin/assignments/dlq/resolve`, 
        { id }, 
        { headers: authHeaders() }
      );
      toast.success('DLQ failure marked as resolved!');
      fetchData();
    } catch (err) {
      toast.error('Failed to resolve DLQ item');
    } finally {
      setResolvingId(null);
    }
  };

  const getHealthColor = () => {
    if (!stats) return 'bg-gray-100 text-gray-700';
    if (stats.systemStatus === 'HEALTHY') return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-500 rounded-2xl p-8 mb-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⚙️</span>
              <Typography variant="h4" className="font-bold">Autonomous Assignment Center</Typography>
            </div>
            <Typography variant="paragraph" className="opacity-85 text-sm">
              Configure background scheduler routines, manage the Review Queue, resolve execution failures (DLQ), and monitor placement readiness stats.
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleTriggerManualRun}
              disabled={triggering}
              className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-5 py-2.5 rounded-lg shadow transition-all text-xs"
            >
              {triggering ? '⚡ Executing…' : '⚡ Trigger Manual Run'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard label="System Status" value={stats.systemStatus} color={getHealthColor()} />
          <StatCard label="Auto-Assignments" value={stats.totalAssignments} color="bg-blue-50 text-blue-800" />
          <StatCard label="Completed Tasks" value={stats.completedAssignments} color="bg-green-50 text-green-800" />
          <StatCard label="Pending Review" value={stats.pendingReview} color="bg-orange-50 text-orange-800" />
          <StatCard label="Estimated API Cost" value={`$${stats.totalCost.toFixed(2)}`} color="bg-purple-50 text-purple-800" />
        </div>
      )}

      {/* Tabs Layout */}
      <div className="flex border-b border-gray-200 mb-6 gap-2">
        {[
          { key: 'settings', label: '🛠 Settings' },
          { key: 'review', label: `📥 Review Queue (${reviewQueue.length})` },
          { key: 'dlq', label: `⚠️ DLQ / Failures (${dlq.length})` },
          { key: 'logs', label: '📄 Job Logs' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              activeTab === t.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Loading Panel */}
      {loadingStats ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB: settings */}
          {activeTab === 'settings' && (
            <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm">
              <Typography variant="h6" className="font-bold text-gray-800 mb-4">Automation Parameters & Limits</Typography>
              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Enabled flag */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Typography variant="small" className="font-bold text-gray-700">Enable Autonomous Flow</Typography>
                      <span className="text-[10px] text-gray-400">Trigger automatic assignments for eligible students</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.AUTO_ASSIGNMENTS_ENABLED}
                      onChange={(e) => setSettings({ ...settings, AUTO_ASSIGNMENTS_ENABLED: e.target.checked })}
                      className="w-5 h-5 accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Frequency selection */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Execution Frequency</label>
                    <select
                      value={settings.AUTO_ASSIGNMENT_FREQUENCY}
                      onChange={(e) => setSettings({ ...settings, AUTO_ASSIGNMENT_FREQUENCY: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option value="daily">Daily Midnight</option>
                      <option value="weekly">Weekly Sunday</option>
                    </select>
                  </div>

                  {/* Readiness Threshold */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Eligibility Threshold Score (0 - 100)</label>
                    <input
                      type="number"
                      value={settings.AUTO_ASSIGNMENT_THRESHOLD}
                      onChange={(e) => setSettings({ ...settings, AUTO_ASSIGNMENT_THRESHOLD: parseInt(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  {/* Batch size */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Process Batch Size (per run)</label>
                    <input
                      type="number"
                      value={settings.AUTO_ASSIGNMENT_BATCH_SIZE}
                      onChange={(e) => setSettings({ ...settings, AUTO_ASSIGNMENT_BATCH_SIZE: parseInt(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  {/* Cooldown days */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Cooldown Period (Days)</label>
                    <input
                      type="number"
                      value={settings.AUTO_ASSIGNMENT_COOLDOWN_DAYS}
                      onChange={(e) => setSettings({ ...settings, AUTO_ASSIGNMENT_COOLDOWN_DAYS: parseInt(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  {/* Expiry days */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Default Assignment Expiry (Days)</label>
                    <input
                      type="number"
                      value={settings.DEFAULT_EXPIRY_DAYS}
                      onChange={(e) => setSettings({ ...settings, DEFAULT_EXPIRY_DAYS: parseInt(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  {/* Max assignments limit */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Max Total Assignments (per run)</label>
                    <input
                      type="number"
                      value={settings.MAX_ASSIGNMENTS_PER_RUN}
                      onChange={(e) => setSettings({ ...settings, MAX_ASSIGNMENTS_PER_RUN: parseInt(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  {/* Cost Control limit */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Max AI/LLM Calls (Rule Fallback Limit)</label>
                    <input
                      type="number"
                      value={settings.MAX_LLM_ASSIGNMENTS_PER_RUN}
                      onChange={(e) => setSettings({ ...settings, MAX_LLM_ASSIGNMENTS_PER_RUN: parseInt(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <Button
                    type="submit"
                    disabled={submittingSettings}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold text-xs"
                  >
                    {submittingSettings ? '⏳ Saving…' : '💾 Save Settings'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB: Review Queue */}
          {activeTab === 'review' && (
            <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <Typography variant="h6" className="font-bold text-gray-800 mb-4">Low Confidence Recommendations Queue</Typography>
              {reviewQueue.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">No low-confidence assignments pending review.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 border-b border-gray-200">
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Subject / Type</th>
                        <th className="p-3">Readiness</th>
                        <th className="p-3">Confidence</th>
                        <th className="p-3">Rationale</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reviewQueue.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50/50">
                          <td className="p-3 font-semibold text-gray-800">
                            {item.userId?.name || '—'}
                            <span className="block text-[10px] text-gray-400 font-normal">Roll: {item.studentId?.rollNo || '—'} · {item.studentId?.branch || ''}</span>
                          </td>
                          <td className="p-3">{item.assignmentType}</td>
                          <td className="p-3 font-bold">{item.readinessScore?.toFixed(1)}</td>
                          <td className="p-3">
                            <span className="bg-orange-100 text-orange-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                              {(item.confidence * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="p-3 max-w-[200px] truncate" title={item.reasoning}>{item.reasoning}</td>
                          <td className="p-3 text-right">
                            <div className="inline-flex gap-2">
                              <Button
                                onClick={() => handleResolveReview(item._id, 'approve')}
                                size="sm"
                                disabled={resolvingId === item._id}
                                className="bg-green-600 text-white text-[10px] px-2 py-1 rounded"
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleResolveReview(item._id, 'reject')}
                                size="sm"
                                variant="outlined"
                                disabled={resolvingId === item._id}
                                className="border-red-300 text-red-600 hover:bg-red-50 text-[10px] px-2 py-1 rounded"
                              >
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* TAB: DLQ / Failures */}
          {activeTab === 'dlq' && (
            <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <Typography variant="h6" className="font-bold text-gray-800 mb-4">Dead Letter Queue (Execution Failures)</Typography>
              {dlq.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">No job failures or DLQ entries recorded.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 border-b border-gray-200">
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Job / Operation</th>
                        <th className="p-3">Reason</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dlq.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50/50">
                          <td className="p-3 font-semibold text-gray-800">
                            {item.userId?.name || '—'}
                            <span className="block text-[10px] text-gray-400 font-normal">{item.userId?.email_id || ''}</span>
                          </td>
                          <td className="p-3 font-medium">{item.jobName}</td>
                          <td className="p-3 max-w-[250px] truncate text-red-600" title={item.failureReason}>{item.failureReason}</td>
                          <td className="p-3 text-gray-500">{new Date(item.createdAt).toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {item.resolved ? 'Resolved' : 'Failed'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {!item.resolved && (
                              <Button
                                onClick={() => handleResolveDlq(item._id)}
                                size="sm"
                                disabled={resolvingId === item._id}
                                className="bg-indigo-600 text-white text-[10px] px-2.5 py-1 rounded"
                              >
                                Mark Resolved
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* TAB: Logs */}
          {activeTab === 'logs' && (
            <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <Typography variant="h6" className="font-bold text-gray-800 mb-4">Automation Scheduler Execution History</Typography>
              {logs.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">No log files found. Run the scheduler to generate reports.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 border-b border-gray-200">
                        <th className="p-3">Job Name</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Processed / Assigned</th>
                        <th className="p-3">AI / Rule Ratio</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Executed At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {logs.map((log) => (
                        <tr key={log._id} className="hover:bg-gray-50/50">
                          <td className="p-3 font-semibold text-gray-800">{log.jobName}</td>
                          <td className="p-3">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              log.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3 font-medium">
                            Processed {log.processed} · Assigned {log.assigned}
                          </td>
                          <td className="p-3 text-gray-500">
                            LLM {log.llmAssignments || 0} · Rule {log.ruleAssignments || 0}
                          </td>
                          <td className="p-3 font-semibold">{log.durationMs}ms</td>
                          <td className="p-3 text-gray-500">{new Date(log.startedAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AutomationCenter;
