import mongoose from "mongoose";
interface Iuser extends Document {
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;

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
    
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model<Iuser>("User", userschema)

export default User
