import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import User from "@/models/user.model";
import Vechile from "@/models/Vechile.model";
import Partnerdocs from "@/models/Partner.docs.model";
import Partnerbank from "@/models/PartnerBankDetails";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        // Fixed condition: !session.user?.email instead of session.user?.email
        if (!session || !session.user?.email || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        await connectDB();
        
        const { id: partnerid } = await params;
        
        const partner = await User.findById(partnerid);
        // Fixed condition: partner.role !== 'partner' instead of == 'partner'
        if (!partner || partner.role !== "partner") {
            return NextResponse.json({ error: "Partner not found or not a partner" }, { status: 404 });
        }
        
        // Correct model names based on your schemas
        const vechile = await Vechile.findOne({ owner: partnerid });
        const document = await Partnerdocs.findOne({ owner: partnerid });
        const bank = await Partnerbank.findOne({ owner: partnerid });
        
        if (!vechile || !document || !bank) {
            return NextResponse.json({ error: "Incomplete partner details" }, { status: 404 });
        }
        
        return NextResponse.json({ partner, vechile, document, bank });
      
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch partner review" }, { status: 500 });
    }
}
