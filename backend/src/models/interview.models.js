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
        type: String
    },
    vocabularyExplanation: {
        type: String
    },
    grammarExplanation: {
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


export { Interview, InterviewQuestion, InterviewByJD, InterviewByResume, InterviewByCoreSubjects };