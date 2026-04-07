import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import User from "@/models/user.model";
import Vechile from "@/models/Vechile.model";
import Partnerdocs from "@/models/Partner.docs.model";
import Partnerbank from "@/models/PartnerBankDetails";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDB();
        const session = await auth();
        
        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Find users who have completed primary onboarding (steps >= 3)
        const pendingPartners = await User.find({ 
            role: "partner", 
            partneronbaordingsteps: { $gte: 3 } 
        }).lean();

        // Enhance with related details
        const detailedPartners = await Promise.all(pendingPartners.map(async (partner: any) => {
            const [vehicle, docs, bank] = await Promise.all([
                Vechile.findOne({ owner: partner._id }).lean(),
                Partnerdocs.findOne({ owner: partner._id }).lean(),
                Partnerbank.findOne({ owner: partner._id }).lean()
            ]);

            return {
                ...partner,
                vehicle,
                docs,
                bank
            };
        }));

        return NextResponse.json({ partners: detailedPartners }, { status: 200 });

    } catch (error) {
        console.error("Admin API Error:", error);
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

        const updatedUser = await User.findById(partnerId);
        if (!updatedUser) {
            return NextResponse.json({ error: "Partner not found" }, { status: 404 });
        }

        if (action === "approve") {
            // Move to next stage, e.g., Video KYC (Step 4) or just mark as fully live (Step 8)
            // For now, let's move to Step 4 (Video KYC) as per the STEPS array
            updatedUser.partneronbaordingsteps = 4;
            
            // Also update underlying models status
            await Promise.all([
                Vechile.findOneAndUpdate({ owner: partnerId }, { status: "approved" }),
                Partnerdocs.findOneAndUpdate({ owner: partnerId }, { status: "approved" }),
                Partnerbank.findOneAndUpdate({ owner: partnerId }, { status: "verified" })
            ]);
        } else if (action === "reject") {
            // Reset steps or keep at 3 but mark as rejected?
            // Let's keep at 3 but update the sub-models with rejection reasons
            await Promise.all([
                Vechile.findOneAndUpdate({ owner: partnerId }, { status: "rejected", rejectionreason: reason }),
                Partnerdocs.findOneAndUpdate({ owner: partnerId }, { status: "rejected", rejectionreason: reason }),
                Partnerbank.findOneAndUpdate({ owner: partnerId }, { rejectionreason: reason })
            ]);
        }

        await updatedUser.save();
        return NextResponse.json({ message: `Partner ${action}ed successfully` }, { status: 200 });

    } catch (error) {
        console.error("Admin PATCH Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
