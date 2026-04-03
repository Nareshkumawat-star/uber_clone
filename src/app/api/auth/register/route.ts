import connectDB from "@/lif/db"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import User from "@/models/user.model"
export async function POST(req:NextRequest){
    try {
        
    const {name,email,password} = await req.json()
      await connectDB()

      const user = await User.findOne({email})
      if(user){
        return NextResponse.json({message:"User already exists"}, {status:400})
      }
      if(password.length<6){
        return NextResponse.json({message:"Password must be at least 6 characters long"}, {status:400})
      }
      const hashedPassword = await bcrypt.hash(password,10)
      const newUser = new User({
        name,
        email,
        password:hashedPassword
      })
      await newUser.save()
      return NextResponse.json({message:"User created successfully", newUser}, {status:201})
    } catch (error) {
        console.log(error)
        return NextResponse.json({message:"Internal server error"}, {status:500})
    }
  
    
}