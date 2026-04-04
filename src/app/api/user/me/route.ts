import connectDB from "@/lif/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import User from "@/models/user.model";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const session = await auth();
        
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error: any) {
        console.error("API Error:", error.message);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}