import axios from "axios";
import { StudentAssignment } from "../models/studentAssignment.model.js";
import {
  Interview,
  AdminInterview,
  AdminSubjectInterview,
  AdminVerbalInterview,
  AdminWrittenInterview,
  AdminCompanyInterview,
  InterviewQuestionsByAdmin,
} from "../models/interview.models.js";
import { Student, User } from "../models/users.models.js";
import sendMail from "../utils/sendMail.js";
import InterviewInvitationTemplate from "../utils/emailTemplates/interviewInvitation.js";

const FASTAPI_URL =
  process.env.FASTAPI_URL || "http://localhost:8000";

const INTERVIEW_BASE_URL =
  process.env.INTERVIEW_BASE_URL || "https://glamis.in/myInterview/";

// ─── Type → interview config mapping ───────────────────────────────────────

const TYPE_CONFIG = {
  "DSA Interview":    { type: "subject", subject: "DSA",     questions: 10, easy: 3, medium: 5, hard: 2 },
  "DBMS Interview":   { type: "subject", subject: "DBMS",    questions: 10, easy: 3, medium: 5, hard: 2 },
  "OS Interview":     { type: "subject", subject: "OS",      questions: 10, easy: 3, medium: 5, hard: 2 },
  "CN Interview":     { type: "subject", subject: "CN",      questions: 10, easy: 3, medium: 5, hard: 2 },
  "Verbal Interview": { type: "verbal",  subject: "Communication", questions: 8, easy: 3, medium: 3, hard: 2 },
  "HR Interview":     { type: "verbal",  subject: "HR",      questions: 8, easy: 4, medium: 3, hard: 1 },
  "Written Test":     { type: "written", subject: "Aptitude", questions: 15, easy: 6, medium: 6, hard: 3 },
  "Company Mock":     { type: "company", subject: "Company", questions: 12, easy: 3, medium: 5, hard: 4 },
  "Placement Drive":  { type: "company", subject: "Placement", questions: 15, easy: 3, medium: 7, hard: 5 },
};

const PRIORITY_DIFFICULTY = {
  Critical: "Hard",
  High:     "Hard",
  Medium:   "Medium",
  Low:      "Easy",
};

// ─── 1. Call FastAPI Assignment Agent ──────────────────────────────────────

export const callFastAPIRoadmap = async (userId, jdMatchScore, targetCompany) => {
  const params = {};
  if (jdMatchScore != null) params.jd_match_score = jdMatchScore;
  if (targetCompany)        params.target_company  = targetCompany;

  const { data } = await axios.get(
    `${FASTAPI_URL}/api/v1/admin/assignment/roadmap/${userId}`,
    { params, timeout: 30000 }
  );
  return data;
};

// ─── 2. Generate & store recommendations for one student ──────────────────

export const generateAndStoreRecommendations = async (
  studentId,
  userId,
  { jdMatchScore, targetCompany } = {}
) => {
  // Call FastAPI using the MongoDB userId string
  const roadmap = await callFastAPIRoadmap(String(userId), jdMatchScore, targetCompany);

  // Remove any existing "recommended" entries (replace with fresh batch)
  await StudentAssignment.deleteMany({ studentId, status: "recommended" });

  const created = [];
  for (const rec of roadmap.recommendations || []) {
    const config = TYPE_CONFIG[rec.interviewType] || {};
    const doc = await StudentAssignment.create({
      studentId,
      userId,
      assignmentType:          rec.interviewType,
      difficulty:              PRIORITY_DIFFICULTY[rec.priority] || "Medium",
      priority:                rec.priority,
      status:                  "recommended",
      recommendedBy:           roadmap.generatedBy || "InterviewAssignmentAgent",
      reasoning:               rec.rationale,
      agentSummary:            roadmap.agentSummary,
      readinessScore:          roadmap.readinessScore,
      weakSubjects:            roadmap.weakSubjects || [],
      estimatedDurationMinutes: rec.estimatedDurationMinutes,
      prerequisiteMet:         rec.prerequisiteMet,
      jdMatchScore:            jdMatchScore ?? null,
      targetCompany:           targetCompany ?? null,
      placementEligible:       roadmap.placementEligible ?? false,
      confidence:              rec.confidence ?? 0.90,
    });
    created.push(doc);
  }

  return { roadmap, assignments: created };
};

// ─── 3. Approve assignment (auto-create interview) ────────────────────────

export const approveAssignment = async (assignmentId, adminUserId) => {
  const assignment = await StudentAssignment.findById(assignmentId)
    .populate({ path: "studentId", populate: { path: "user", select: "name email_id" } })
    .populate("userId", "name email_id");

  if (!assignment) throw Object.assign(new Error("Assignment not found"), { statusCode: 404 });
  if (assignment.status !== "recommended") {
    throw Object.assign(new Error(`Cannot approve an assignment with status '${assignment.status}'`), { statusCode: 400 });
  }

  const student = assignment.studentId;
  const user    = assignment.userId;

  if (!student || !user) {
    throw Object.assign(new Error("Student or user reference is missing"), { statusCode: 400 });
  }

  const config   = TYPE_CONFIG[assignment.assignmentType] || { type: "subject", questions: 10, easy: 3, medium: 5, hard: 2 };
  const subject  = config.subject || assignment.assignmentType;
  const now      = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateStr  = tomorrow.toISOString().split("T")[0];
  const fromStr  = "10:00";
  const toStr    = "12:00";
  const title    = `[AI] ${assignment.assignmentType} — ${user.name}`;

  // Create individual Interview document for the student
  const interview = new Interview({
    description: `AI-assigned ${assignment.assignmentType}. Reason: ${assignment.reasoning}`,
    start_time:  `${dateStr}T${fromStr}`,
    end_time:    `${dateStr}T${toStr}`,
    title,
    totalQuestions: config.questions,
    type: config.type,
    avatar_enabled: false,
  });
  await interview.save();

  // Push interview to student's interview_taken list
  await Student.findByIdAndUpdate(student._id, {
    $push: { interview_taken: interview._id },
  });

  // Create AdminInterview entry for tracking
  let adminInterview;
  const adminBase = {
    name:           title,
    date:           dateStr,
    from:           fromStr,
    to:             toStr,
    students:       [student._id],
    interview:      [interview._id],
    no_of_questions: config.questions,
    questions:      [],
    link:           INTERVIEW_BASE_URL,
  };

  if (config.type === "subject") {
    adminInterview = new AdminSubjectInterview({
      ...adminBase,
      subject:  subject,
      easy:     config.easy,
      medium:   config.medium,
      hard:     config.hard,
    });
  } else if (config.type === "verbal") {
    adminInterview = new AdminVerbalInterview({
      ...adminBase,
      easy:   config.easy,
      medium: config.medium,
      hard:   config.hard,
    });
  } else if (config.type === "written") {
    adminInterview = new AdminWrittenInterview({
      ...adminBase,
      fillInTheBlanks:       Math.floor(config.questions * 0.3),
      synonymsAndAntonyms:   Math.floor(config.questions * 0.2),
      domain:                subject,
      essay:                 Math.floor(config.questions * 0.2),
      jumbled:               Math.floor(config.questions * 0.2),
      errorDetection:        Math.floor(config.questions * 0.1),
    });
  } else {
    // company / placement
    adminInterview = new AdminCompanyInterview({
      ...adminBase,
      company:          assignment.targetCompany || "General",
      job_description:  assignment.reasoning || "AI-assigned company mock interview",
      easy_remaining:   config.easy,
      medium_remaining: config.medium,
      hard_remaining:   config.hard,
      position:         subject,
    });
  }

  await adminInterview.save();

  // Send email notification
  try {
    await sendMail(
      user.email_id,
      "New Interview Assigned by AI",
      InterviewInvitationTemplate(
        title,
        subject,
        INTERVIEW_BASE_URL,
        `${dateStr} at ${fromStr}`
      )
    );
  } catch (emailErr) {
    console.warn("Email notification failed (non-fatal):", emailErr.message);
  }

  // Update assignment status
  assignment.status         = "assigned";
  assignment.assignedAt     = now;
  assignment.reviewedBy     = adminUserId;
  assignment.interviewId    = interview._id;
  assignment.adminInterviewId = adminInterview._id;
  await assignment.save();

  return { assignment, interview, adminInterview };
};

// ─── 4. Reject assignment ─────────────────────────────────────────────────

export const rejectAssignment = async (assignmentId, adminUserId, reason = "") => {
  const assignment = await StudentAssignment.findById(assignmentId);
  if (!assignment) throw Object.assign(new Error("Assignment not found"), { statusCode: 404 });
  if (assignment.status !== "recommended") {
    throw Object.assign(new Error(`Cannot reject an assignment with status '${assignment.status}'`), { statusCode: 400 });
  }

  assignment.status          = "cancelled";
  assignment.reviewedBy      = adminUserId;
  assignment.rejectionReason = reason;
  await assignment.save();

  return assignment;
};

// ─── 5. List assignments (admin) ──────────────────────────────────────────

export const getAssignments = async ({
  status,
  priority,
  assignmentType,
  page = 1,
  limit = 20,
} = {}) => {
  const filter = {};
  if (status)         filter.status         = status;
  if (priority)       filter.priority       = priority;
  if (assignmentType) filter.assignmentType = assignmentType;

  const skip  = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    StudentAssignment.find(filter)
      .populate({ path: "studentId", select: "branch rollNo section" })
      .populate({ path: "userId",    select: "name email_id" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    StudentAssignment.countDocuments(filter),
  ]);

  return { assignments: docs, total, page, pages: Math.ceil(total / limit) };
};

// ─── 6. Student-facing: get my assignments ────────────────────────────────

export const getStudentAssignments = async (userId) => {
  const student = await Student.findOne({ user: userId });
  if (!student) return [];

  return StudentAssignment.find({
    studentId: student._id,
    status: { $in: ["assigned", "in_progress", "completed"] },
  })
    .populate("interviewId", "title type start_time end_time attemptedQuestions totalQuestions")
    .sort({ createdAt: -1 });
};

// ─── 7. Update assignment status (called from interview completion hooks) ──

export const updateAssignmentStatus = async (interviewId, newStatus) => {
  return StudentAssignment.findOneAndUpdate(
    { interviewId },
    {
      status:      newStatus,
      ...(newStatus === "completed" ? { completedAt: new Date() } : {}),
    },
    { new: true }
  );
};

// ─── 8. Bulk generate ─────────────────────────────────────────────────────

export const bulkGenerateRecommendations = async (studentUserIds, options = {}) => {
  const results = [];
  const errors  = [];

  for (const uid of studentUserIds) {
    try {
      const user    = await User.findById(uid);
      const student = user ? await Student.findOne({ user: uid }) : null;
      if (!user || !student) { errors.push({ userId: uid, error: "User or student not found" }); continue; }

      const result = await generateAndStoreRecommendations(student._id, user._id, options);
      results.push({ userId: uid, assignments: result.assignments.length });
    } catch (err) {
      errors.push({ userId: uid, error: err.message });
    }
  }

  return { results, errors };
};

// ─── 9. Analytics ─────────────────────────────────────────────────────────

export const getAnalytics = async () => {
  const [statusCounts, priorityCounts, typeCounts, total] = await Promise.all([
    StudentAssignment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    StudentAssignment.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
    StudentAssignment.aggregate([{ $group: { _id: "$assignmentType", count: { $sum: 1 } } }]),
    StudentAssignment.countDocuments(),
  ]);

  const byStatus   = Object.fromEntries(statusCounts.map(s => [s._id, s.count]));
  const byPriority = Object.fromEntries(priorityCounts.map(p => [p._id, p.count]));
  const byType     = Object.fromEntries(typeCounts.map(t => [t._id, t.count]));

  const completed = byStatus.completed || 0;
  const assigned  = byStatus.assigned  || 0;
  const completionRate = (assigned + completed) > 0
    ? Math.round((completed / (assigned + completed)) * 100)
    : 0;

  // Placement-eligible count
  const placementReady = await StudentAssignment.countDocuments({ placementEligible: true, status: { $in: ["recommended", "assigned"] } });

  // Most assigned types
  const sortedTypes = Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return {
    total,
    byStatus,
    byPriority,
    byType,
    completionRate,
    placementEligibleCount: placementReady,
    topAssignedTypes: sortedTypes.map(([type, count]) => ({ type, count })),
  };
};

// ─── 10. Lazy Create Interview (Step 10) ───────────────────────────────────

export const lazyCreateInterview = async (assignmentId) => {
  const assignment = await StudentAssignment.findById(assignmentId)
    .populate({ path: "studentId", populate: { path: "user", select: "name email_id" } })
    .populate("userId", "name email_id");

  if (!assignment) {
    throw Object.assign(new Error("Assignment not found"), { statusCode: 404 });
  }

  // If already created, return existing
  if (assignment.interviewId) {
    if (assignment.status === "assigned") {
      assignment.status = "in_progress";
      await assignment.save();
    }
    const interview = await Interview.findById(assignment.interviewId);
    return { assignment, interview };
  }

  const student = assignment.studentId;
  const user    = assignment.userId;

  if (!student || !user) {
    throw Object.assign(new Error("Student or user reference is missing"), { statusCode: 400 });
  }

  const config   = TYPE_CONFIG[assignment.assignmentType] || { type: "subject", questions: 10, easy: 3, medium: 5, hard: 2 };
  const subject  = config.subject || assignment.assignmentType;
  const now      = new Date();
  
  // Set start and end times dynamically
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr  = tomorrow.toISOString().split("T")[0];
  const fromStr  = "10:00";
  const toStr    = "12:00";
  const title    = `[AI] ${assignment.assignmentType} — ${user.name}`;

  // 1. Create individual Interview document
  const interview = new Interview({
    description: `AI-assigned ${assignment.assignmentType}. Reason: ${assignment.reasoning}`,
    start_time:  `${dateStr}T${fromStr}`,
    end_time:    `${dateStr}T${toStr}`,
    title,
    totalQuestions: config.questions,
    type: config.type,
    avatar_enabled: false,
  });
  await interview.save();

  // 2. Push interview to student's interview_taken list
  await Student.findByIdAndUpdate(student._id, {
    $push: { interview_taken: interview._id },
  });

  // 3. Create AdminInterview entry for tracking
  let adminInterview;
  const adminBase = {
    name:           title,
    date:           dateStr,
    from:           fromStr,
    to:             toStr,
    students:       [student._id],
    interview:      [interview._id],
    no_of_questions: config.questions,
    questions:      [],
    link:           INTERVIEW_BASE_URL,
  };

  if (config.type === "subject") {
    adminInterview = new AdminSubjectInterview({
      ...adminBase,
      subject:  subject,
      easy:     config.easy,
      medium:   config.medium,
      hard:     config.hard,
    });
  } else if (config.type === "verbal") {
    adminInterview = new AdminVerbalInterview({
      ...adminBase,
      easy:   config.easy,
      medium: config.medium,
      hard:   config.hard,
    });
  } else if (config.type === "written") {
    adminInterview = new AdminWrittenInterview({
      ...adminBase,
      fillInTheBlanks:       Math.floor(config.questions * 0.3),
      synonymsAndAntonyms:   Math.floor(config.questions * 0.2),
      domain:                subject,
      essay:                 Math.floor(config.questions * 0.2),
      jumbled:               Math.floor(config.questions * 0.2),
      errorDetection:        Math.floor(config.questions * 0.1),
    });
  } else {
    adminInterview = new AdminCompanyInterview({
      ...adminBase,
      company:          assignment.targetCompany || "General",
      job_description:  assignment.reasoning || "AI-assigned company mock interview",
      easy_remaining:   config.easy,
      medium_remaining: config.medium,
      hard_remaining:   config.hard,
      position:         subject,
    });
  }

  await adminInterview.save();

  // 4. Update assignment details
  assignment.status         = "in_progress";
  assignment.assignedAt     = assignment.assignedAt || now;
  assignment.interviewId    = interview._id;
  assignment.adminInterviewId = adminInterview._id;
  await assignment.save();

  return { assignment, interview, adminInterview };
};
