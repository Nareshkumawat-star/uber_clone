import mongoose from "mongoose";
interface Iuser extends Document {
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    role: "user" | "partner" | "admin";

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
        required: true
    },
    role: {
        type: String,
        enum: ["user", "partner", "admin"],
        default: "user"
    }
    
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model<Iuser>("User", userschema)

export default User
