import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    end_time: {
        type: Date
    },
    start_time: {
        type: Date,
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    },

    attemptedQuestions: {
        type: Number,
        default: 0
    },
    firstAttemptedAt: {
        type: Date
    },
    lastAttemptedAt: {
        type: Date
    },
    totalQuestions: {
        type: Number,
        // required: true   // todo: make sure to add totalQuestions everywhere in createInterviews
    },
    evaluatedQuestions: {
        type: Number,
        default: 0
        // required: true   // todo: make sure to add totalQuestions everywhere in createInterviews
    },
    tabSwitchCount: {
        type: Number,
        default: 0
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: "subject",
        required: true
    },
    // When true, the assigned student takes this interview with the real-time
    // AI avatar (voice + video) instead of the text interview. Set by the admin
    // when scheduling a company interview.
    avatar_enabled: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const interviewQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    interview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview'
    },
    answer: {
        type: String
    },
    expectedAnswer: {
        type: String
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    fluency: {
        type: Number
    },
    grammar: {
        type: Number
    },
    overallPerformance: {
        type: Number
    },
    pronunciation: {
        type: Number
    },
    correctness: {
        type: Number
    },
    vocabulary: {
        type: Number
    },
    technicalSkills: {
        type: Number
    },
    technicalExplanation: {
        type: [String]
    },
    vocabularyExplanation: {
        type: [String]
    },
    pronunciationExplanation: {
        type: [String]
    },
    correctnessExplanation: {
        type: [String]
    },
    grammarExplanation: {
        type: [String]
    },
}, { timestamps: true })

const interviewByJD = new mongoose.Schema({
    job_description: {
        type: String,
        required: true
    },
    interview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview'
    }
}, { timestamps: true })


const interviewByResume = new mongoose.Schema({
    resume: {
        type: String,
        required: true
    },
    interview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview'
    }
}, { timestamps: true })


const interviewByCoreSubjects = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    interview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview'
    }
}, { timestamps: true })


const adminInterviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    students: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Student"
    },
    interview: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Interview"
    },
    is_active: {
        type: Boolean,
        default: true
    },
    no_of_questions: {
        type: Number,
        required: true
    },
    questions: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "InterviewQuestionByAdmin"
    },
    link: {
        type: String,
        required: true
    },
    // Whether assigned students take this scheduled interview with the real-time
    // AI avatar interviewer. Set by the admin per interview type; mirrored onto
    // each student's Interview doc. Lives on the base schema so every interview
    // discriminator (company/subject/verbal/written/svar) inherits it.
    avatar_enabled: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const AdminInterview = mongoose.model('AdminInterview', adminInterviewSchema);

const adminCompanyInterviewSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true
    },
    job_description: {
        type: String,
        required: true
    },
    easy_remaining: {
        type: Number,
        required: true
    },
    medium_remaining: {
        type: Number,
        required: true
    },
    hard_remaining: {
        type: Number,
        required: true
    },
    position: {
        type: String,
        required: true
    }
});

const adminSubjectInterviewSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    easy: {
        type: Number,
        required: true
    },
    medium: {
        type: Number,
        required: true
    },
    hard: {
        type: Number,
        required: true
    }
});

const adminVerbalInterviewSchema = new mongoose.Schema({
    easy: {
        type: Number,
        required: true
    },
    medium: {
        type: Number,
        required: true
    },
    hard: {
        type: Number,
        required: true
    }
});

const adminWrittenInterviewSchema = new mongoose.Schema({
    fillInTheBlanks: {
        type: Number,
        required: true
    },
    synonymsAndAntonyms: {
        type: Number,
        required: true
    },
    domain: {
        type: String,
        required: true
    },
    essay: {
        type: Number,
        required: true
    },
    jumbled: {
        type: Number,
        required: true
    },
    errorDetection: {
        type: Number,
        required: true
    }
});

const adminSvarInterviewSchema = new mongoose.Schema({
    reading: {
        type: Number,
        required: true
    },
    repeating: {
        type: Number,
        required: true
    },
    short: {
        type: Number,
        required: true
    },
    jumbled: {
        type: Number,
        required: true
    },
    comprehension: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    }
});

export const AdminCompanyInterview = AdminInterview.discriminator('AdminCompanyInterview', adminCompanyInterviewSchema);
export const AdminSubjectInterview = AdminInterview.discriminator('AdminSubjectInterview', adminSubjectInterviewSchema);
export const AdminVerbalInterview = AdminInterview.discriminator('AdminVerbalInterview', adminVerbalInterviewSchema);
export const AdminWrittenInterview = AdminInterview.discriminator('AdminWrittenInterview', adminWrittenInterviewSchema);
export const AdminSvarInterview = AdminInterview.discriminator('AdminSvarInterview', adminSvarInterviewSchema);

const interviewQuestionByAdmin = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true
    }
},
    { timestamps: true }
);


const SessionQuestion = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    questionNo: {
        type: Number,
        required: true
    },
    interview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview'
    },
}, { timestamps: true });


export const InterviewQuestionsByAdmin = mongoose.model('InterviewQuestionByAdmin', interviewQuestionByAdmin);
export const Interview = mongoose.model('Interview', interviewSchema);
export const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);
export const SessionQuestions = mongoose.model('SessionQuestions', SessionQuestion);
export const InterviewByJD = mongoose.model('InterviewByJD', interviewByJD);
export const InterviewByResume = mongoose.model('InterviewByResume', interviewByResume);
export const InterviewByCoreSubjects = mongoose.model('InterviewByCoreSubjects', interviewByCoreSubjects);
