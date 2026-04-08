import mongoose from "mongoose";
interface Iuser extends Document {
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    role: "user" | "partner" | "admin";
    partneronbaordingsteps:number;
    mobileNumber?: string
    videoKycStatus: "not_required" |"pending" | "in_progress"| "approved" | "rejected";
    videokycrejectionreason?:string

}

const userschema = new mongoose.Schema<Iuser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        enum: ["user", "partner", "admin"],
        default: "partner"
    },
    partneronbaordingsteps:{
        type:Number,
        min:0,
        max:8,
        default:0
    },
    mobileNumber:{
        type:String,
        unique:true,
        sparse:true
    },
    videoKycStatus:{
        type:String,
        enum:["not_required","pending","in_progress","approved","rejected"],
        default:"not_required"
    },
    videokycrejectionreason:{
        type:String,
    }
    
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model<Iuser>("User", userschema)

export default User
