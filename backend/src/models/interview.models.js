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
    title: {
        type: String,
        required: true
    }
}, { timestamps: true })

const Interview = mongoose.model('Interview', interviewSchema);

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
    interview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview'
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
    pronounciation: {
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
    grammarExplanation: {
        type: [String]
    },
    expectedAnswer: {
        type: String
    },
}, { timestamps: true })

const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);

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

const InterviewByJD = mongoose.model('InterviewByJD', interviewByJD);


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

const InterviewByResume = mongoose.model('InterviewByResume', interviewByResume);

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

const InterviewByCoreSubjects = mongoose.model('InterviewByCoreSubjects', interviewByCoreSubjects);


const adminCompanyInterview = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    company: {
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
    job_description: {
        type: String,
        required: true
    },
    students: {
        type: [mongoose.Schema.Types.ObjectId],
        // required : true,
        ref: "Student"
    },
    interview: {
        type: [mongoose.Schema.Types.ObjectId],
        // required : true,
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
    questions: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "InterviewQuestionByAdmin"
    },
    position: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    }
},
    { timestamps: true }
);

const AdminCompanyInterview = mongoose.model('AdminCompanyInterview', adminCompanyInterview);

const adminSubjectInterview = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    subject: {
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
        // required : true,
        ref: "Student"
    },
    interview: {
        type: [mongoose.Schema.Types.ObjectId],
        // required : true,
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
    },
    questions: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "InterviewQuestionByAdmin"
    },
    link: {
        type: String,
        required: true
    }
},
    { timestamps: true }
);

const AdminSubjectInterview = mongoose.model('AdminSubjectInterview', adminSubjectInterview);


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

const InterviewQuestionsByAdmin = mongoose.model('InterviewQuestionByAdmin', interviewQuestionByAdmin);


export { Interview, InterviewQuestion,AdminSubjectInterview, InterviewByJD, InterviewByResume, InterviewByCoreSubjects, AdminCompanyInterview, InterviewQuestionsByAdmin };