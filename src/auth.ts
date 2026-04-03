import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
 import connectDB from "@/lif/db"
 import User from "@/models/user.model"
 import bcrypt from "bcryptjs"
 import { JWT } from "next-auth/jwt"    

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
        name:"Credentials",
        credentials:{
            email:{
                type:"email"
            },
            password:{
                type:"password"
            }
        },

        async authorize(credentials , request){
            if(!credentials?.email || !credentials?.password){
                return null
            }
            const password = credentials.password as string
            const email = credentials.email as string
            await connectDB()
            const user = await User.findOne({email})
            if(!user){
                throw Error("user does not exist ")
            }
            const isPasswordValid = await bcrypt.compare(password,user.password)
            if(!isPasswordValid){
                throw Error("invalid password")
            }
            return{
                id:user._id.toString(),
                email:user.email,
                name:user.name,
                role:user.role
            }
        }
    
    })
  ],
  callbacks:{
    async jwt({token,user}){
        if(user){
            token.id = user.id as string
            token.email = user.email as string
            token.name = user.name as string
            token.role = user.role as string
        }
        return token
    },
    async session({session,token}){
        if(token){
            session.user.id = token.id as string
            session.user.email = token.email as string
            session.user.name = token.name as string
            session.user.role = token.role as string
        }
        return session
    }
  }
})