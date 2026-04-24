import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user.model";

export async function POST(req: NextRequest) {
    try {
        const { partnerId, rating } = await req.json();
        
        if (!partnerId || !rating) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectDB();
        
        const partner = await User.findById(partnerId);
        if (!partner) {
            return NextResponse.json({ error: "Partner not found" }, { status: 404 });
        }

        const currentCount = partner.ratingsCount || 0;
        const currentAvg = partner.averageRating || 0;

        const newCount = currentCount + 1;
        const newAvg = ((currentAvg * currentCount) + rating) / newCount;

        partner.ratingsCount = newCount;
        partner.averageRating = newAvg;
        
        await partner.save();

        return NextResponse.json({ success: true, averageRating: newAvg, ratingsCount: newCount });
    } catch (e) {
        console.error("Error saving rating:", e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
