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

        // Find users who have completed Pricing (step 6) and are waiting for Final Review (step 7)
        const pendingFinalReviews = await User.find({ 
            role: "partner", 
            partneronbaordingsteps: 6 
        }).lean();

        // Enhance with full details
        const detailedPartners = await Promise.all(pendingFinalReviews.map(async (partner: any) => {
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
        console.error("Final Review GET Error:", error);
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
            return NextResponse.json({ error: "Missing partnerId or action" }, { status: 400 });
        }

        const user = await User.findById(partnerId);
        if (!user) {
            return NextResponse.json({ error: "Partner not found" }, { status: 404 });
        }

        if (action === "approve") {
            // Move to Live status (Step 8)
            user.partneronbaordingsteps = 8;
            user.onboardingStatus = "approved"; // If you have this field
            
            // Finalize vehicle if needed
            await Vechile.findOneAndUpdate({ owner: partnerId }, { status: "approved" });
        } else if (action === "reject") {
            // Revert to Pricing (Step 5) or Docs
            user.partneronbaordingsteps = 5; 
            user.finalrejectionreason = reason || "Final review failed.";
            
            await Vechile.findOneAndUpdate({ owner: partnerId }, { status: "rejected", rejectionreason: reason });
        }

        await user.save();
        return NextResponse.json({ message: `Partner final review ${action}d successfully` }, { status: 200 });

    } catch (error) {
        console.error("Final Review PATCH Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
