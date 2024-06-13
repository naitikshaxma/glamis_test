const dotenv = require("dotenv")
const connectDB = require("./db/index.js");
const { app } = require("./app.js");

dotenv.config()

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`App is Running on PORT : ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log(`Mongo DB connection FAILED !! ${err}`)
})