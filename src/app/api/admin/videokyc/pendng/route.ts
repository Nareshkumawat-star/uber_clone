import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import User from "@/models/user.model";

export async function GET() {
    try {
        await connectDB();
        const session = await auth();

        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const pendingKyc = await User.find({
            role: "partner",
            partneronbaordingsteps: 4,
            videoKycStatus: { $nin: ["approved", "rejected"] }
        }).select("name email mobileNumber videoKycStatus createdAt").lean();

        return NextResponse.json({ partners: pendingKyc }, { status: 200 });

    } catch (error) {
        console.error("Video KYC API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await connectDB();
        const session = await auth();

        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { partnerId, action, reason } = await req.json();

        if (!partnerId || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const user = await User.findById(partnerId);
        if (!user) {
            return NextResponse.json({ error: "Partner not found" }, { status: 404 });
        }

        if (action === "approve") {
            user.videoKycStatus = "approved";
            user.partneronbaordingsteps = 5; // Move to next step (Pricing)
        } else if (action === "reject") {
            user.videoKycStatus = "rejected";
            user.videokycrejectionreason = reason || "";
        }

        await user.save();
        return NextResponse.json({ message: `Video KYC ${action}d successfully` }, { status: 200 });

    } catch (error) {
        console.error("Video KYC PATCH Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
