import { connectDB } from "@/lif/db";
import { auth } from "@/auth";
import User from "@/models/user.model";
import Vechile from "@/models/Vechile.model";
import { NextResponse } from "next/server";
import { uploadOncloudinary } from "@/lif/cloudinary";
import Partnerdocs from "@/models/Partner.docs.model";

export async function POST(req: Request) {
    try {
        await connectDB();
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const formdata = await req.formData();
        const aadhar = formdata.get("aadhar") as Blob | null;
        const license = formdata.get("license") as Blob | null;
        const rc = formdata.get("rc") as Blob | null;

        const existingDocs = await Partnerdocs.findOne({ owner: user._id });

        if (!existingDocs && (!license || !aadhar || !rc)) {
            return NextResponse.json({ error: "All documents are required for first time upload" }, { status: 400 });
        }

        const vechile = await Vechile.findOne({ owner: user._id });
        if (!vechile) {
            return NextResponse.json({ error: "Vechile not found" }, { status: 404 });
        }

        const updatepayload: any = {
            status: "pending"
        }

        if (aadhar) {
            const url = await uploadOncloudinary(aadhar);
            if (!url) {
                return NextResponse.json({ error: "Failed to upload aadhar" }, { status: 500 });
            }
            updatepayload.aadharUrl = url;
        }

        if (license) {
            const url = await uploadOncloudinary(license);
            if (!url) {
                return NextResponse.json({ error: "Failed to upload license" }, { status: 500 });
            }
            updatepayload.licenceurl = url;
        }

        if (rc) {
            const url = await uploadOncloudinary(rc);
            if (!url) {
                return NextResponse.json({ error: "Failed to upload rc" }, { status: 500 });
            }
            updatepayload.rcurl = url;
        }

        await Partnerdocs.findOneAndUpdate(
            { owner: user._id },
            { $set: updatepayload },
            { upsert: true, new: true }
        );

        if (user.partneronbaordingsteps < 2) {
            user.partneronbaordingsteps = 2;
            await user.save();
        }

        return NextResponse.json({ message: "Documents uploaded successfully" }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectDB();
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const docs = await Partnerdocs.findOne({ owner: user._id });
        if (!docs) {
            return NextResponse.json({ docs: null }, { status: 200 });
        }

        return NextResponse.json({ docs }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}