import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import User from "@/models/user.model";
import Vechile from "@/models/Vechile.model";

const vechile_regular_expression = /^[A-Z]{2}[0-9]{2}[A-Z]{0,3}[0-9]{1,4}$/;

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
        const {vechileType,vechileModel,vechileNumber} = await req.json();
        if(!vechileType||!vechileModel||!vechileNumber){
            return NextResponse.json({error:"All fields are required"},{status:400});
        }

        const normalizedNumber = vechileNumber.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if(!vechile_regular_expression.test(normalizedNumber)){
            return NextResponse.json({error:`Invalid vehicle number format (e.g. MH12AB1234). Received: ${normalizedNumber}`},{status:400});
        }

        const duplicate = await Vechile.findOne({number:normalizedNumber});
        if(duplicate && duplicate.owner.toString() !== user._id.toString()){
            return NextResponse.json({error:"Vehicle already exists"},{status:400});
        }

        let currentVechile = await Vechile.findOne({owner:user._id});
        if(currentVechile){
            currentVechile.vechileType = vechileType;
            currentVechile.number = normalizedNumber;
            currentVechile.vechileModel = vechileModel;
            currentVechile.status = "pending";
            await currentVechile.save();
        }
        else{
            currentVechile = await Vechile.create({
                owner: user._id,
                vechileType,
                vechileModel,
                number: normalizedNumber,
                basfare: 0,
                priceperkm: 0,
                waitingcharge: 0,
                status: "pending"
            });
        }

        if(user.partneronbaordingsteps < 1){
            user.partneronbaordingsteps = 1;
        }
        if (user.role === "user") {
            user.role = "partner";
        }
        await user.save();

        return NextResponse.json({vechile: currentVechile},{status:201});
    }
    catch(error){
        console.log(error);
        return NextResponse.json({error:"Internal server error"},{status:500});
    }
}


export async function GET(req:Request){
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
        const vechile = await Vechile.findOne({owner:user._id});
        if(!vechile){
            return NextResponse.json({vechile: null},{status:200});
        }
        return NextResponse.json({vechile},{status:200});
    }
    catch(error){
        console.log(error);
        return NextResponse.json({error:"Internal server error"},{status:500});
    }
}