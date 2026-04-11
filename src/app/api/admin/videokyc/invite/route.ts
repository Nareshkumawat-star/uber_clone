import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import User from "@/models/user.model";
import { sendKycInviteEmail } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        await connectDB();
        const session = await auth();

        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { partnerId } = await req.json();

        if (!partnerId) {
            return NextResponse.json({ error: "Missing partnerId" }, { status: 400 });
        }

        const partner = await User.findById(partnerId);
        if (!partner) {
            return NextResponse.json({ error: "Partner not found" }, { status: 404 });
        }

        if (partner.videoKycStatus !== 'pending' && partner.partneronbaordingsteps < 4) {
             return NextResponse.json({ error: "Partner is not eligible for Video KYC yet" }, { status: 400 });
        }

        try {
            await sendKycInviteEmail(partner.email, partner.name, partner._id.toString());
            return NextResponse.json({ message: "Invitation sent successfully" }, { status: 200 });
        } catch (emailError) {
            console.error("Failed to send KYC invite email manually:", emailError);
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

    } catch (error) {
        console.error("Video KYC Invite API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
