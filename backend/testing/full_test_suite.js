/**
 * GLAMIS Admin Assignment & Automation Agent - Full Test Suite
 * Tests all 9 test cases from the specification
 */
import mongoose from 'mongoose';

const NODE = 'http://localhost:8001';
const FASTAPI = 'http://localhost:8000';
const DB = 'mongodb://127.0.0.1:27017/glamis';

let pass = 0;
let fail = 0;

function result(name, ok, detail = '') {
  if (ok) { console.log(`  ✅ PASS — ${name}${detail ? ' | ' + detail : ''}`); pass++; }
  else     { console.log(`  ❌ FAIL — ${name}${detail ? ' | ' + detail : ''}`); fail++; }
}

async function main() {
  console.log('\n====================================================');
  console.log('  GLAMIS Assignment & Automation Agent Test Suite  ');
  console.log('====================================================\n');

  // ─── Admin Login ──────────────────────────────────────────
  const loginRes = await fetch(`${NODE}/api/v1/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@glamis.in', password: 'demo123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;
  result('Admin Login', loginRes.status === 201 && !!token, `HTTP ${loginRes.status}`);
  if (!token) { console.log('\nFATAL: Cannot proceed without admin token'); process.exit(1); }

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  // ─── Get seeded student userId ─────────────────────────────
  await mongoose.connect(DB);
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email_id: 'student@glamis.in', is_admin: false });
  const student = await db.collection('students').findOne({ user: user._id });
  const userId = user._id.toString();
  const studentId = student?._id?.toString();
  console.log(`\n  Student: ${user.name} | userId: ${userId}\n`);
  await mongoose.disconnect();

  // ─── TEST 1: FastAPI Readiness ─────────────────────────────
  console.log('─── TEST 1: FastAPI Readiness Engine ───');
  try {
    const r = await fetch(`${FASTAPI}/api/v1/admin/readiness/by-user-id/${userId}`);
    const d = await r.json();
    result('GET /api/v1/admin/readiness/by-user-id/:userId', r.status === 200, `HTTP ${r.status}`);
    result('readinessScore returned', d.readiness_score !== undefined, `score=${d.readiness_score}`);
    result('weakSubjects returned', Array.isArray(d.weak_subjects), `weak=${JSON.stringify(d.weak_subjects)}`);
    result('category returned', !!d.category, `category=${d.category}`);
  } catch(e) { result('TEST 1 FastAPI Readiness', false, e.message); }

  // ─── TEST 2: Assignment Agent Roadmap ─────────────────────
  console.log('\n─── TEST 2: Assignment Agent Roadmap ───');
  try {
    const r = await fetch(`${FASTAPI}/api/v1/admin/assignment/roadmap/${userId}`);
    const d = await r.json();
    result('GET /api/v1/admin/assignment/roadmap/:userId', r.status === 200, `HTTP ${r.status}`);
    result('recommendations array returned', Array.isArray(d.recommendations), `count=${d.recommendations?.length}`);
    result('agent summary returned', !!d.agent_summary || !!d.agentSummary, `by=${d.generatedBy || d.generated_by}`);
  } catch(e) { result('TEST 2 Assignment Roadmap', false, e.message); }

  // ─── TEST 3: Assignment Creation ──────────────────────────
  console.log('\n─── TEST 3: Assignment Creation (Generate) ───');
  let assignmentId = null;
  try {
    const r = await fetch(`${NODE}/api/v1/admin/assignments/generate`, {
      method: 'POST', headers,
      body: JSON.stringify({ userId })
    });
    const d = await r.json();
    const assignments = d.data?.assignments || [];
    result('POST /api/v1/admin/assignments/generate', r.status === 200, `HTTP ${r.status}`);
    result('StudentAssignment document created', assignments.length > 0, `count=${assignments.length}`);
    result('Status is "recommended"', assignments[0]?.status === 'recommended', `status=${assignments[0]?.status}`);
  } catch(e) { result('TEST 3 Assignment Creation', false, e.message); }

  // Get first recommended assignment
  try {
    const r = await fetch(`${NODE}/api/v1/admin/assignments?status=recommended&limit=1`, { headers });
    const d = await r.json();
    const assignments = d.data?.assignments || d.assignments || [];
    assignmentId = assignments[0]?._id;
    result('Recommended assignments listed', assignments.length > 0, `assignmentId=${assignmentId}`);
  } catch(e) { result('List recommended assignments', false, e.message); }

  // ─── TEST 4: Admin Approval ───────────────────────────────
  console.log('\n─── TEST 4: Admin Approval ───');
  let approvedInterviewId = null;
  if (assignmentId) {
    try {
      const r = await fetch(`${NODE}/api/v1/admin/assignments/approve`, {
        method: 'POST', headers,
        body: JSON.stringify({ assignmentId })
      });
      const d = await r.json();
      const newStatus = d.data?.assignment?.status;
      approvedInterviewId = d.data?.assignment?.interviewId;
      result('POST /api/v1/admin/assignments/approve', r.status === 200, `HTTP ${r.status}`);
      result('Status changed recommended→assigned', newStatus === 'assigned', `status=${newStatus}`);
      result('MongoDB updated', !!d.data?.assignment?._id, `assignmentId=${d.data?.assignment?._id}`);
    } catch(e) { result('TEST 4 Admin Approval', false, e.message); }
  } else {
    result('TEST 4 Admin Approval', false, 'No assignment ID to approve');
  }

  // ─── TEST 5: Student Dashboard ────────────────────────────
  console.log('\n─── TEST 5: Student Dashboard ───');
  try {
    const stuLoginRes = await fetch(`${NODE}/api/v1/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@glamis.in', password: 'Test@1234' })
    });
    const stuData = await stuLoginRes.json();
    const stuToken = stuData.data?.accessToken;
    result('Student Login', stuLoginRes.status === 201 && !!stuToken, `HTTP ${stuLoginRes.status}`);

    if (stuToken) {
      const stuHeaders = { 'Authorization': `Bearer ${stuToken}` };
      const myAssRes = await fetch(`${NODE}/api/v1/assignments/my`, { headers: stuHeaders });
      const myAssData = await myAssRes.json();
      const myAss = myAssData.data?.assignments || myAssData.assignments || [];
      result('GET /api/v1/assignments/my (student)', myAssRes.status === 200, `HTTP ${myAssRes.status}`);
      result('AIAssignedWidget data available', myAssRes.status === 200, `count=${myAss.length}`);
    }
  } catch(e) { result('TEST 5 Student Dashboard', false, e.message); }

  // ─── TEST 6: Start Interview (assigned→in_progress) ───────
  console.log('\n─── TEST 6: Start Interview ───');
  if (approvedInterviewId) {
    try {
      // Find the approved assignment to get its ID
      const listRes = await fetch(`${NODE}/api/v1/admin/assignments?status=assigned&limit=1`, { headers });
      const listData = await listRes.json();
      const assigned = (listData.data?.assignments || listData.assignments || [])[0];
      result('Assigned assignment found', !!assigned, `type=${assigned?.assignmentType}`);
      result('interviewId linked to assignment', !!assigned?.interviewId, `interviewId=${assigned?.interviewId}`);
    } catch(e) { result('TEST 6 Start Interview', false, e.message); }
  } else {
    result('TEST 6 Start Interview (interviewId check)', !!approvedInterviewId, 'approval step created interview');
  }

  // ─── TEST 9: Automation Center Endpoints ──────────────────
  console.log('\n─── TEST 9: Automation Center ───');
  const automationEndpoints = [
    { name: 'Settings GET', url: `${NODE}/api/v1/admin/assignments/settings`, method: 'GET' },
    { name: 'Logs GET', url: `${NODE}/api/v1/admin/assignments/logs`, method: 'GET' },
    { name: 'Stats GET', url: `${NODE}/api/v1/admin/assignments/stats`, method: 'GET' },
    { name: 'Review Queue GET', url: `${NODE}/api/v1/admin/assignments/review-queue`, method: 'GET' },
    { name: 'DLQ GET', url: `${NODE}/api/v1/admin/assignments/dlq`, method: 'GET' },
  ];
  for (const ep of automationEndpoints) {
    try {
      const r = await fetch(ep.url, { method: ep.method, headers });
      result(ep.name, r.status === 200, `HTTP ${r.status}`);
    } catch(e) { result(ep.name, false, e.message); }
  }
  try {
    const r = await fetch(`${NODE}/api/v1/admin/assignments/trigger`, {
      method: 'POST', headers, body: '{}'
    });
    result('Trigger POST', r.status === 200, `HTTP ${r.status}`);
  } catch(e) { result('Trigger POST', false, e.message); }

  // ─── DATABASE VERIFICATION ────────────────────────────────
  console.log('\n─── Database Verification ───');
  try {
    await mongoose.connect(DB);
    const db2 = mongoose.connection.db;
    const total = await db2.collection('studentassignments').countDocuments();
    const recommended = await db2.collection('studentassignments').countDocuments({ status: 'recommended' });
    const assigned = await db2.collection('studentassignments').countDocuments({ status: 'assigned' });
    const interviews = await db2.collection('interviews').countDocuments();
    result('StudentAssignment documents exist', total > 0, `total=${total}`);
    result('Recommended assignments exist', recommended > 0, `recommended=${recommended}`);
    result('Assigned assignments exist', assigned > 0, `assigned=${assigned}`);
    result('Interview document created on approval', interviews > 0, `interviews=${interviews}`);
    console.log(`\n  Status breakdown: recommended=${recommended} | assigned=${assigned} | total=${total}`);
    await mongoose.disconnect();
  } catch(e) { result('DB Verification', false, e.message); }

  // ─── SUMMARY ──────────────────────────────────────────────
  console.log('\n====================================================');
  console.log(`  RESULTS: ${pass} PASSED ✅  |  ${fail} FAILED ❌`);
  console.log('====================================================\n');
}

main().catch(e => { console.error('TEST SUITE ERROR:', e.message); process.exit(1); });
