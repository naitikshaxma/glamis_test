
// Full E2E audit using built-in fetch (Node 24 has native fetch)
import mongoose from 'mongoose';

const NODE = 'http://localhost:8001';
const DB = 'mongodb://127.0.0.1:27017/glamis';

async function loginAdmin() {
  console.log('\n=== ADMIN LOGIN ===');
  const r = await fetch(`${NODE}/api/v1/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@glamis.in', password: 'demo123' })
  });
  const data = await r.json();
  console.log('Admin login HTTP status:', r.status);
  if (r.status === 201 && data.data?.accessToken) {
    console.log('Admin login: SUCCESS');
    console.log('Admin user:', data.data?.userData?.name || 'unknown');
    return data.data.accessToken;
  }
  console.log('Admin login FAILED. Response:', JSON.stringify(data).substring(0, 400));
  return null;
}

async function getFirstStudentInfo() {
  await mongoose.connect(DB);
  const db = mongoose.connection.db;
  // Use the known seeded student
  const user = await db.collection('users').findOne({ email_id: 'student@glamis.in', is_admin: false });
  const student = await db.collection('students').findOne({ user: user._id });
  await mongoose.disconnect();
  return { userId: user._id.toString(), studentId: student?._id?.toString(), name: user.name, email: user.email_id };
}

async function generateRecommendation(token, userId) {
  console.log('\n=== GENERATE RECOMMENDATION ===');
  console.log('Calling POST /api/v1/admin/assignments/generate for userId:', userId);
  const r = await fetch(`${NODE}/api/v1/admin/assignments/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ userId })
  });
  console.log('HTTP Status:', r.status);
  const text = await r.text();
  console.log('Response:', text.substring(0, 1200));
  return r.status === 200 ? JSON.parse(text) : null;
}

async function listAssignments(token, status = 'recommended') {
  console.log(`\n=== LIST ASSIGNMENTS (status=${status}) ===`);
  const r = await fetch(`${NODE}/api/v1/admin/assignments?status=${status}&limit=10`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('HTTP Status:', r.status);
  const text = await r.text();
  try {
    const data = JSON.parse(text);
    console.log('Total:', data.total || data.data?.total);
    const assignments = data.assignments || data.data?.assignments || [];
    console.log('Returned:', assignments.length);
    if (assignments.length > 0) {
      const a = assignments[0];
      console.log('Sample:', JSON.stringify({
        _id: a._id,
        type: a.assignmentType,
        status: a.status,
        readinessScore: a.readinessScore,
        reasoning: (a.reasoning || '').substring(0, 80),
        recommendedBy: a.recommendedBy
      }, null, 2));
      return a._id;
    }
  } catch(e) {
    console.log('Parse error, raw:', text.substring(0, 400));
  }
  return null;
}

async function approveAssignment(token, assignmentId) {
  console.log('\n=== APPROVE ASSIGNMENT ===');
  console.log('assignmentId:', assignmentId);
  const r = await fetch(`${NODE}/api/v1/admin/assignments/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ assignmentId })
  });
  console.log('HTTP Status:', r.status);
  const text = await r.text();
  console.log('Response:', text.substring(0, 800));
  return r.status === 200;
}

async function dbVerification() {
  console.log('\n=== DATABASE EVIDENCE ===');
  await mongoose.connect(DB);
  const db = mongoose.connection.db;
  
  const statuses = ['recommended', 'assigned', 'in_progress', 'completed', 'cancelled'];
  const counts = {};
  for (const s of statuses) {
    counts[s] = await db.collection('studentassignments').countDocuments({ status: s });
  }
  console.log('Assignment status counts:', JSON.stringify(counts));
  
  // Latest assignment
  const latest = await db.collection('studentassignments').find({}).sort({ createdAt: -1 }).limit(1).toArray();
  if (latest.length > 0) {
    const a = latest[0];
    console.log('Latest assignment:', JSON.stringify({
      _id: a._id,
      assignmentType: a.assignmentType,
      status: a.status,
      readinessScore: a.readinessScore,
      reasoning: (a.reasoning || '').substring(0, 100),
      recommendedBy: a.recommendedBy,
      interviewId: a.interviewId,
      createdAt: a.createdAt
    }, null, 2));
  }
  
  // Check for any interviewId set on assignments
  const withInterview = await db.collection('studentassignments').countDocuments({ interviewId: { $ne: null, $exists: true } });
  console.log('Assignments with interviewId:', withInterview);
  
  const interviews = await db.collection('interviews').countDocuments();
  const reports = await db.collection('reports').countDocuments();
  const notifications = await db.collection('notifications').countDocuments();
  console.log('Interviews in DB:', interviews);
  console.log('Reports in DB:', reports);
  console.log('Notifications in DB:', notifications);
  
  await mongoose.disconnect();
}

async function checkBullMQJobs() {
  console.log('\n=== BULLMQ JOB STATUS ===');
  try {
    const { createClient } = await import('redis');
    const client = createClient({ url: 'redis://127.0.0.1:6379' });
    await client.connect();
    
    const assignmentFailed = await client.lLen('bull:assignment-jobs:failed');
    const notificationFailed = await client.lLen('bull:notification-jobs:failed');
    const assignmentWaiting = await client.lLen('bull:assignment-jobs:wait');
    const notificationWaiting = await client.lLen('bull:notification-jobs:wait');
    
    console.log('assignment-jobs failed:', assignmentFailed);
    console.log('assignment-jobs waiting:', assignmentWaiting);
    console.log('notification-jobs failed:', notificationFailed);
    console.log('notification-jobs waiting:', notificationWaiting);
    
    // Check completed jobs count
    const allKeys = await client.keys('bull:*');
    const jobTypes = {};
    allKeys.forEach(k => {
      const parts = k.split(':');
      const queueName = parts[1];
      const suffix = parts[parts.length - 1];
      if (!jobTypes[queueName]) jobTypes[queueName] = new Set();
      jobTypes[queueName].add(suffix);
    });
    console.log('Queue analysis:', JSON.stringify(Object.fromEntries(Object.entries(jobTypes).map(([k,v]) => [k, [...v]]))));
    
    await client.quit();
  } catch(e) {
    console.log('Redis check failed:', e.message);
  }
}

async function checkJobsController() {
  console.log('\n=== CHECKING JOBS CONFIG ===');
  // Check what jobs are registered
  const r = await fetch(`${NODE}/api/v1/admin/assignments/settings`, {
    headers: { 'Authorization': 'no-auth' }
  });
  console.log('GET /settings status:', r.status);
}

async function main() {
  try {
    // STEP 1: Admin Login
    let adminToken = await loginAdmin();
    
    if (!adminToken) {
      console.log('COULD NOT LOGIN - check credentials');
    } else {
      // STEP 2: Get first student
      const studentInfo = await getFirstStudentInfo();
      console.log('\n=== STUDENT INFO ===');
      console.log('userId:', studentInfo.userId, 'name:', studentInfo.name);
      
      // STEP 3: Generate recommendation
      await generateRecommendation(adminToken, studentInfo.userId);
      
      // STEP 4: List recommended assignments
      const assignmentId = await listAssignments(adminToken, 'recommended');
      
      // STEP 5: Approve if found
      if (assignmentId) {
        await approveAssignment(adminToken, assignmentId);
        await listAssignments(adminToken, 'assigned');
      } else {
        console.log('\nNo recommended assignments to approve - checking assigned:');
        await listAssignments(adminToken, 'assigned');
      }
    }
    
    // STEP 6: DB verification
    await dbVerification();
    
    // STEP 7: BullMQ check
    await checkBullMQJobs();
    
  } catch(e) {
    console.error('AUDIT ERROR:', e.message);
    console.error(e.stack);
  }
}

main();
