import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import User from "@/models/user.model";
import Vechile from "@/models/Vechile.model";
import { NextResponse } from "next/server";
import { uploadOncloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
    try {
        await connectDB();
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formdata = await req.formData();
        const basfare = formdata.get("basfare");
        const priceperkm = formdata.get("priceperkm");
        const waitingcharge = formdata.get("waitingcharge");
        const vehicleImage = formdata.get("vehicleImage") as Blob | null;

        if (!basfare || !priceperkm || !waitingcharge) {
            return NextResponse.json({ error: "All pricing fields are required" }, { status: 400 });
        }

        const userId = session.user.id;
        const updatePayload: any = {
            basfare: Number(basfare),
            priceperkm: Number(priceperkm),
            waitingcharge: Number(waitingcharge)
        };

        if (vehicleImage) {
            const url = await uploadOncloudinary(vehicleImage);
            if (!url) {
                return NextResponse.json({ error: "Failed to upload vehicle image" }, { status: 500 });
            }
            updatePayload.imageurl = url;
            updatePayload.status = "pending"; // Reset status for review if image changes
        }

        // Update the vehicle model
        const updatedVehicle = await Vechile.findOneAndUpdate(
            { owner: userId },
            { $set: updatePayload },
            { new: true }
        );

        if (!updatedVehicle) {
            return NextResponse.json({ error: "Vehicle not found. Complete previous steps first." }, { status: 404 });
        }

        // Increment onboarding steps to 6
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { partneronbaordingsteps: 6 },
            { new: true }
        );

        return NextResponse.json({ 
            message: "Pricing and image saved successfully",
            user: updatedUser,
            vehicle: updatedVehicle
        }, { status: 200 });

    } catch (error) {
        console.error("Pricing API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
