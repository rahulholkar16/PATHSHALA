import mongoose from "mongoose";
import bcrypt from "bcrypt";

const Schema = mongoose.Schema;

const user = new Schema({
    "name": { type: String, required: true },
    "email": { type: String, unique: true, required: true },
    "password": { type: String, required: true },
    "role": { 
        type: String, 
        enum: ['student', 'instructor', 'admin'], 
        default: 'student', 
        required: true
    },
    "avatar": { type: String },
    "bio": { type: String },
    "enrolledCourse": [ { type: Schema.Types.ObjectId, ref: "Course" } ],
    "teachingCourse": [{ type: Schema.Types.ObjectId, ref: "Course" } ],
    "isVerified": { type: Boolean, default: false },
    "verificationToken": { type: String },
    "verificationTokenExpire": { type: Date },
    "resetPasswordToken": { type: String },
    "resetPasswordExpire": { type: Date },
}, {timestamps: true});

user.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 5);
    next();
})

export const UserModel = mongoose.model("User", user);