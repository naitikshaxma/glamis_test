const mongoose = require("mongoose")
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email_id : {
        type : String,
        required : true,
        unique : true,
        index : true
    },
    phone : {
        type : Number,
        length : 10,
        required : true,
        unique : true,
        index : true
    },
    otp : {
        type : Number,
        length : 6
    },
    password : {
        type : String,
        required : true,  
        minLength : 4
    },
    is_email_verified : {
        type : Boolean,
        default : false
    },
    refreshToken : {
        type : String
    }
},{timestamps:true})


const studentProfileSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    avatar : {
        type : String
    },
    course : {
        type : String
    },
    branch : {
        type : String
    },
    semester : {
        type : Number
    },
    section : {
        type : String
    },
    address : {
        type : String
    },
    idCard : {
        type : String
    },
    resume : {
        type : String
    },
},{timestamps:true})


userSchema.plugin(mongooseAggregatePaginate)

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)    
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id : this._id,
        phone : this.phone
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id : this._id, 
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}

const User = mongoose.model("User", userSchema)
const Profile = mongoose.model("Profile", studentProfileSchema)

module.exports = {
    User,
    Profile
}