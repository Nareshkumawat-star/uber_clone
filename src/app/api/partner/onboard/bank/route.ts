import { connectDB } from "@/lif/db";
import { auth } from "@/auth";
import User from "@/models/user.model";
import { NextResponse } from "next/server";
import Partnerbank from "@/models/PartnerBankDetails";
export async function POST(req:Request){
    try{
        await connectDB();
        const session = await auth();
        if(!session|| !session.user?.email){
            return NextResponse.json({error:"Unauthorized"},{status:401});
        }
        const user = await User.findOne({email:session.user.email});
        if(!user){
            return NextResponse.json({error:"User not found"},{status:404});
        }
        const { bankname, accountholder, upi, accountnumber, ifsc, mobileNumber } = await req.json();
        if (!bankname || !accountholder || !accountnumber || !ifsc || !mobileNumber) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const bank = await Partnerbank.findOneAndUpdate(
            { owner: user._id },
            { 
                $set: {
                    bankname,
                    accountholder,
                    accountnumber,
                    ifsc,
                    upi,
                    status: "added"
                }
            },
            { upsert: true, new: true }
        );

        if (user.partneronbaordingsteps < 3) {
            user.partneronbaordingsteps = 3;
        }
        user.mobileNumber = mobileNumber;
        await user.save();
        return NextResponse.json({ bank }, { status: 201 });
    }
    catch(error){
        console.log(error);
        return NextResponse.json({error:"partner bank eorror"},{status:500});
    }
}
export async function GET(){
    try{
        await connectDB();
        const session = await auth();
        if(!session|| !session.user?.email){
            return NextResponse.json({error:"Unauthorized"},{status:401});
        }
        const user = await User.findOne({email:session.user.email});
        if(!user){
            return NextResponse.json({error:"User not found"},{status:404});
        }
        const bank = await Partnerbank.findOne({owner:user._id});
        if(!bank){
            return NextResponse.json({bank: null, mobileNumber: user.mobileNumber},{status:200});
        }
        return NextResponse.json({bank, mobileNumber: user.mobileNumber},{status:200});
    }
    catch(error){
        console.log(error);
        return NextResponse.json({error:"partner bank eorror"},{status:500});
    }
}