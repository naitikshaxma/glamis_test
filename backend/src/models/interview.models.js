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
    },
    type: {
        type: String,
        default: "subject",
        required: true
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

export const AdminSubjectInterview = mongoose.model('AdminSubjectInterview', adminSubjectInterview);

const adminVerbalInterview = new mongoose.Schema({
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
        // required : true,
        ref: "Student"
    },
    interview: {
        type: [mongoose.Schema.Types.ObjectId],
        // required : true,
        ref: "Interview"
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
    }
},
    { timestamps: true }
);


const adminWrittenInterview = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
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
    },
    questions: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "InterviewQuestionByAdmin"
    },
    link: {
        type: String,
        required: true
    }
},{ timestamps: true });


const adminSvarInterview = new mongoose.Schema({
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
    no_of_questions: {
        type: Number,
        required: true
    },
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
    questions: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "InterviewQuestionByAdmin"
    },
    students: {
        type: [mongoose.Schema.Types.ObjectId],
        // required : true,
        ref: "Student"
    },
    type: {
        type: String,
        required: true
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
    link: {
        type: String,
        required: true
    }
},
    { timestamps: true }
);



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


export const InterviewQuestionsByAdmin = mongoose.model('InterviewQuestionByAdmin', interviewQuestionByAdmin);
export const Interview = mongoose.model('Interview', interviewSchema);
export const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);
export const AdminCompanyInterview = mongoose.model('AdminCompanyInterview', adminCompanyInterview);
export const AdminVerbalInterview = mongoose.model('AdminVerbalInterview', adminVerbalInterview);
export const AdminSvarInterview = mongoose.model('AdminSvarInterview', adminSvarInterview);
export const AdminWrittenInterview = mongoose.model('AdminWrittenInterview', adminWrittenInterview);
export const InterviewByJD = mongoose.model('InterviewByJD', interviewByJD);
export const InterviewByResume = mongoose.model('InterviewByResume', interviewByResume);
export const InterviewByCoreSubjects = mongoose.model('InterviewByCoreSubjects', interviewByCoreSubjects);
