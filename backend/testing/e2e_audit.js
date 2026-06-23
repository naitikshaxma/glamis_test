
import fetch from 'node-fetch';
import mongoose from 'mongoose';

const NODE = 'http://localhost:8001';
const DB = 'mongodb://127.0.0.1:27017/glamis';

// Step 1: Login as admin
async function loginAdmin() {
  console.log('\n=== ADMIN LOGIN ===');
  const r = await fetch(`${NODE}/api/v1/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@glamis.in', password: 'demo123' })
  });
  const data = await r.json();
  console.log('Login status:', r.status);
  if (data.data?.accessToken) {
    console.log('Admin login: SUCCESS');
    return data.data.accessToken;
  }
  console.log('Response:', JSON.stringify(data).substring(0, 300));
  return null;
}

// Step 2: Get first student userId
async function getFirstStudent(token) {
  console.log('\n=== GET STUDENT FOR ASSIGNMENT ===');
  // Connect to DB
  await mongoose.connect(DB);
  const db = mongoose.connection.db;
  // Use the seeded student whose password we know
  const user = await db.collection('users').findOne({ email_id: 'student@glamis.in', is_admin: false });
  const student = await db.collection('students').findOne({ user: user._id });
  await mongoose.disconnect();
  
  console.log('Student userId:', user._id.toString());
  console.log('Student name:', user.name);
  console.log('Student _id:', student?._id.toString());
  return { userId: user._id.toString(), studentId: student?._id.toString(), name: user.name };
}

// Step 3: Generate recommendation via Node.js -> FastAPI
async function generateRecommendation(token, userId) {
  console.log('\n=== GENERATE RECOMMENDATION (Admin → Node.js → FastAPI) ===');
  const r = await fetch(`${NODE}/api/v1/admin/assignments/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ userId })
  });
  const status = r.status;
  const text = await r.text();
  console.log('POST /api/v1/admin/assignments/generate status:', status);
  console.log('Response:', text.substring(0, 1000));
  return { status, text };
}

// Step 4: List all recommended assignments
async function listRecommendedAssignments(token) {
  console.log('\n=== LIST RECOMMENDED ASSIGNMENTS ===');
  const r = await fetch(`${NODE}/api/v1/admin/assignments?status=recommended&limit=5`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const status = r.status;
  const text = await r.text();
  console.log('GET /api/v1/admin/assignments?status=recommended status:', status);
  try {
    const data = JSON.parse(text);
    console.log('Total assignments:', data.total);
    if (data.assignments?.length > 0) {
      const a = data.assignments[0];
      console.log('First recommended assignment:', JSON.stringify({
        _id: a._id,
        status: a.status,
        assignmentType: a.assignmentType,
        readinessScore: a.readinessScore,
        reasoning: (a.reasoning || '').substring(0, 100),
        recommendedBy: a.recommendedBy
      }, null, 2));
      return a._id;
    }
  } catch(e) {
    console.log('Response:', text.substring(0, 500));
  }
  return null;
}

// Step 5: Approve the assignment
async function approveAssignment(token, assignmentId) {
  console.log('\n=== APPROVE ASSIGNMENT ===');
  const r = await fetch(`${NODE}/api/v1/admin/assignments/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ assignmentId })
  });
  const status = r.status;
  const text = await r.text();
  console.log('POST /api/v1/admin/assignments/approve status:', status);
  console.log('Response:', text.substring(0, 800));
  return { status, text };
}

// Step 6: DB verification
async function verifyDB(studentId) {
  console.log('\n=== DB VERIFICATION ===');
  await mongoose.connect(DB);
  const db = mongoose.connection.db;

  const ObjectId = mongoose.Types.ObjectId;
  
  // Count new assignments
  const totalAssignments = await db.collection('studentassignments').countDocuments();
  const recommended = await db.collection('studentassignments').countDocuments({ status: 'recommended' });
  const assigned = await db.collection('studentassignments').countDocuments({ status: 'assigned' });
  const inProgress = await db.collection('studentassignments').countDocuments({ status: 'in_progress' });
  const completed = await db.collection('studentassignments').countDocuments({ status: 'completed' });

  console.log('Total StudentAssignments:', totalAssignments);
  console.log('  recommended:', recommended);
  console.log('  assigned:', assigned);
  console.log('  in_progress:', inProgress);
  console.log('  completed:', completed);

  // Latest assignments
  const latest = await db.collection('studentassignments').find({}).sort({ createdAt: -1 }).limit(3).toArray();
  console.log('\nLATEST 3 ASSIGNMENTS:');
  latest.forEach((a, i) => {
    console.log(`  [${i+1}] ${a.assignmentType} | status=${a.status} | readiness=${a.readinessScore} | by=${a.recommendedBy}`);
    console.log(`       reasoning: ${(a.reasoning || 'MISSING').substring(0, 80)}`);
  });

  // Check interviewquestions
  const iqCount = await db.collection('interviewquestions').countDocuments();
  console.log('\ninterviewquestions:', iqCount);

  // Check notifications
  const notiCount = await db.collection('notifications').countDocuments();
  console.log('notifications:', notiCount);

  await mongoose.disconnect();
}

// Step 7: Test student my-assignments endpoint
async function loginStudent() {
  console.log('\n=== STUDENT LOGIN ===');
  // Login with the known seeded student
  const r = await fetch(`${NODE}/api/v1/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@glamis.in', password: 'Test@1234' })
  });
  const data = await r.json();
  console.log('Student login status:', r.status);
  console.log('Response:', JSON.stringify(data).substring(0, 400));
  return data.data?.accessToken || null;
}

async function getMyAssignments(studentToken) {
  console.log('\n=== STUDENT MY ASSIGNMENTS ===');
  const r = await fetch(`${NODE}/api/v1/assignments/my`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  console.log('GET /api/v1/assignments/my status:', r.status);
  const text = await r.text();
  try {
    const data = JSON.parse(text);
    const assignments = Array.isArray(data.data) ? data.data : (data.data?.assignments || data.assignments || []);
    console.log('My assignments count:', assignments.length);
    if (assignments.length > 0) {
      const a = assignments[0];
      console.log('First assignment:', JSON.stringify({
        _id: a._id,
        type: a.assignmentType,
        status: a.status,
        interviewId: a.interviewId
      }, null, 2));
      return a._id;
    }
  } catch(e) {
    console.log('Response:', text.substring(0, 500));
  }
  return null;
}

async function main() {
  try {
    // Admin flow
    const adminToken = await loginAdmin();
    if (!adminToken) {
      console.log('FATAL: Could not login as admin');
      return;
    }

    const { userId, studentId } = await getFirstStudent(adminToken);

    await generateRecommendation(adminToken, userId);
    
    const assignmentId = await listRecommendedAssignments(adminToken);
    if (assignmentId) {
      await approveAssignment(adminToken, assignmentId);
    }

    await verifyDB(studentId);

    // Student flow
    const studentToken = await loginStudent();
    if (studentToken) {
      const myAssignmentId = await getMyAssignments(studentToken);
    }

  } catch(e) {
    console.error('ERROR:', e.message);
  }
}

main();
