const mongoose = require("mongoose")
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    first_name : {
        type : String
    },
    last_name : {
        type : String
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
    cash : {
        type : Number,
        default : 0
    },
    refreshToken : {
        type : String
    }
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

module.exports = {
    User
}