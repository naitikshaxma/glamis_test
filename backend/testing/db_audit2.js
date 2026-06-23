
import mongoose from 'mongoose';

async function audit() {
  await mongoose.connect('mongodb://127.0.0.1:27017/glamis');
  const db = mongoose.connection.db;

  // Assignment statuses
  const statuses = await db.collection('studentassignments').aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]).toArray();
  console.log('ASSIGNMENT_STATUSES:', JSON.stringify(statuses));

  // RecommendedBy
  const recommendedBy = await db.collection('studentassignments').aggregate([
    { $group: { _id: '$recommendedBy', count: { $sum: 1 } } }
  ]).toArray();
  console.log('RECOMMENDED_BY:', JSON.stringify(recommendedBy));

  // Types
  const types = await db.collection('studentassignments').aggregate([
    { $group: { _id: '$assignmentType', count: { $sum: 1 } } }
  ]).toArray();
  console.log('ASSIGNMENT_TYPES:', JSON.stringify(types));

  // Readiness stats
  const readiness = await db.collection('studentassignments').aggregate([
    { $group: { _id: null, avg: { $avg: '$readinessScore' }, min: { $min: '$readinessScore' }, max: { $max: '$readinessScore' } } }
  ]).toArray();
  console.log('READINESS_STATS:', JSON.stringify(readiness));

  // Interviews
  const interviewCount = await db.collection('interviews').countDocuments();
  const interviews = await db.collection('interviews').find({}).limit(3).toArray();
  console.log('INTERVIEWS_COUNT:', interviewCount);
  if (interviews.length > 0) {
    console.log('INTERVIEW_KEYS:', Object.keys(interviews[0]).join(', '));
    const iv = interviews[0];
    console.log('INTERVIEW_SAMPLE:', JSON.stringify({
      _id: iv._id,
      status: iv.status,
      type: iv.type || iv.interviewType,
      studentId: iv.studentId || iv.userId,
      assignmentId: iv.assignmentId,
      completedAt: iv.completedAt
    }, null, 2));
  }

  // Reports
  const reportCount = await db.collection('reports').countDocuments();
  const report = await db.collection('reports').findOne({});
  console.log('REPORTS_COUNT:', reportCount);
  if (report) {
    console.log('REPORT_KEYS:', Object.keys(report).join(', '));
    console.log('REPORT_SAMPLE:', JSON.stringify(report, null, 2).substring(0, 400));
  }

  // studentreadiness
  const readinessCount = await db.collection('studentreadiness').countDocuments();
  console.log('STUDENT_READINESS_DOCS:', readinessCount);

  // Assignments with no reasoning
  const noReasoning = await db.collection('studentassignments').countDocuments({ reasoning: null });
  const emptyReasoning = await db.collection('studentassignments').countDocuments({ reasoning: '' });
  console.log('ASSIGNMENTS_NO_REASONING:', noReasoning);
  console.log('ASSIGNMENTS_EMPTY_REASONING:', emptyReasoning);

  // Sample assigned assignment
  const assignedAssignment = await db.collection('studentassignments').findOne({ status: 'assigned' });
  if (assignedAssignment) {
    console.log('SAMPLE_ASSIGNED:', JSON.stringify({
      _id: assignedAssignment._id,
      studentId: assignedAssignment.studentId,
      userId: assignedAssignment.userId,
      assignmentType: assignedAssignment.assignmentType,
      status: assignedAssignment.status,
      readinessScore: assignedAssignment.readinessScore,
      reasoning: (assignedAssignment.reasoning || '').substring(0, 150),
      recommendedBy: assignedAssignment.recommendedBy
    }, null, 2));
  }

  // Sample completed assignment
  const completed = await db.collection('studentassignments').findOne({ status: 'completed' });
  if (completed) {
    console.log('SAMPLE_COMPLETED:', JSON.stringify({
      _id: completed._id,
      studentId: completed.studentId,
      status: completed.status,
      readinessScore: completed.readinessScore,
      completedAt: completed.completedAt
    }, null, 2));
  }

  // Count users
  const adminCount = await db.collection('users').countDocuments({ is_admin: true });
  const studentCount = await db.collection('users').countDocuments({ is_admin: false });
  console.log('ADMIN_COUNT:', adminCount);
  console.log('STUDENT_COUNT:', studentCount);

  await mongoose.disconnect();
}

audit().catch(console.error);
