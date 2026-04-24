import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user.model";

export async function POST(req: NextRequest) {
    try {
        const { partnerId, fare } = await req.json();
        
        if (!partnerId || !fare) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectDB();
        
        const partner = await User.findById(partnerId);
        if (!partner) {
            return NextResponse.json({ error: "Partner not found" }, { status: 404 });
        }

        // Add fare to total earnings
        partner.totalEarnings = (partner.totalEarnings || 0) + parseFloat(fare);
        partner.totalRides = (partner.totalRides || 0) + 1;
        
        await partner.save();

        return NextResponse.json({ 
            success: true, 
            totalEarnings: partner.totalEarnings,
            totalRides: partner.totalRides 
        });
    } catch (e) {
        console.error("Error updating earnings:", e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
