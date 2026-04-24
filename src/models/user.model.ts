import mongoose from "mongoose";
interface Iuser extends Document {
    name: string;
    email: string;
    password?: string;
    createdAt: Date;
    updatedAt: Date;
    role: "user" | "partner" | "admin";
    partneronbaordingsteps: number;
    mobileNumber?: string;
    videoKycStatus: "not_required" | "pending" | "in_progress" | "approved" | "rejected";
    videokycrejectionreason?: string;
    onboardingStatus: "pending" | "approved" | "rejected";
    finalrejectionreason?: string;
    ratingsCount?: number;
    averageRating?: number;
    totalEarnings?: number;
    totalRides?: number;
    socketId?: string;
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
    partneronbaordingsteps: {
        type: Number,
        min: 0,
        max: 8,
        default: 0
    },
    mobileNumber: {
        type: String,
        unique: true,
        sparse: true,
        match: [/^\d{10}$/, "Mobile number must be exactly 10 digits"]
    },
    videoKycStatus: {
        type: String,
        enum: ["not_required", "pending", "in_progress", "approved", "rejected"],
        default: "not_required"
    },
    videokycrejectionreason: {
        type: String,
    },
    onboardingStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    finalrejectionreason: {
        type: String,
    },
    ratingsCount: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    totalRides: {
        type: Number,
        default: 0
    },
    socketId: {
        type: String,
    }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model<Iuser>("User", userschema)

export default User
