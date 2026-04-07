import connectDB from "@/lib/db";
import Otp from "@/models/otp.model";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        await connectDB();

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in database
        await Otp.findOneAndUpdate(
            { email },
            { otp: otpCode, createdAt: new Date() },
            { upsert: true, new: true }
        );

        // Configure Nodemailer
        const smtpUser = process.env.EMAIL;
        const smtpPass = process.env.PASS;

        if (!smtpUser || !smtpPass) {
            console.log("\n--- DEVELOPMENT MODE: OTP ---");
            console.log(`Email: ${email}`);
            console.log(`OTP Code: ${otpCode}`);
            console.log("-----------------------------\n");
            return NextResponse.json({ 
                message: "OTP generated (Dev Mode: Check console)", 
                dev: true 
            }, { status: 200 });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        const mailOptions = {
            from: `"GoRide Premium" <${smtpUser}>`,
            to: email,
            subject: "Verification Code for GoRide",
            text: `Your verification code is: ${otpCode}. Valid for 5 minutes.`,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("OTP Error:", error.message);
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
    }
}
