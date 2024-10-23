import { User } from "../models/users.models.js";
export default async function updateFeedback(req,res,next){
    const {students} = req.body;
    for(let i=0;i<students.length;i++){
        const user = await User.findOne({email_id:students[i]});
        if(user){
            user.feedback_submitted = false;
            const updated_user = await user.save();
            console.log(updated_user);
        }
    }
    next();
}