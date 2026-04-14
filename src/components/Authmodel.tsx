'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, Lock, X, Timer } from 'lucide-react'
import axios from 'axios'
import { signIn } from 'next-auth/react'

type steptype = "login" | "signup" | "otp"

function Authmodel({ open, onclose }: { open: boolean; onclose: () => void }) {
    const [step, setstep] = useState<steptype>("login")
    const [email, setemail] = useState("")
    const [password, setpassword] = useState("")
    const [name, setname] = useState("")
    const [loading, setloading] = useState(false)
    const [error, seterror] = useState("")
    const [otp, setotp] = useState(["","","","","",""])

    const sendOtp = async () => {
        setloading(true)
        seterror("")
        try {
            await axios.post("/api/auth/send-otp", { email })
            setstep("otp")
        } catch (err: any) {
            seterror(err.response?.data?.message || "Failed to send OTP")
        } finally {
            setloading(false)
        }
    }

    const handleVerifyOtp = async () => {
        setloading(true)
        seterror("")
        try {
            const code = otp.join("")
            await axios.post("/api/auth/register", { name, email, password, code })
            setstep("login")
            seterror("")
        } catch (err: any) {
            seterror(err.response?.data?.message || "Invalid or expired OTP")
        } finally {
            setloading(false)
        }
    }

    const handlelogin = async () => {
        setloading(true)
        seterror("")
        try {
            const res = await signIn("credentials", { email, password, redirect: false })
            if (res?.error) {
                seterror(res.error)
            } else {
                onclose()
            }
        } catch (err: any) {
            seterror("An unexpected error occurred")
        } finally {
            setloading(false)
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onclose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-sm bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-100 overflow-hidden"
                    >
                        <button onClick={onclose} className="absolute top-6 right-6 text-gray-300 hover:text-black transition-colors"><X size={18} /></button>

                        <div className="text-center mb-10">
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Timer className="text-white w-5 h-5" />
                            </div>
                            <h1 className="text-xl font-black tracking-tighter uppercase">GoRide</h1>
                            <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Premium Platform</p>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                <div className="space-y-3">
                                    {step === "signup" && (
                                        <div className="relative">
                                            <input type="text" placeholder="Full Name" className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 flex px-5 text-xs font-bold transition-all outline-none focus:border-black" onChange={(e)=>setname(e.target.value)} value={name} />
                                        </div>
                                    )}
                                    <div className="relative">
                                        <input type="email" placeholder="Email Address" className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-5 text-xs font-bold transition-all outline-none focus:border-black" onChange={(e)=>setemail(e.target.value)} value={email} />
                                    </div>
                                    {step !== "otp" && (
                                        <div className="relative">
                                            <input type="password" placeholder="Password" className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-5 text-xs font-bold transition-all outline-none focus:border-black" onChange={(e)=>setpassword(e.target.value)} value={password} />
                                        </div>
                                    )}
                                    
                                    {step === "otp" && (
                                        <div className="flex justify-center gap-2 pt-4">
                                            {otp.map((digit, index) => (
                                                <input key={index} id={`otp-${index}`} type="text" maxLength={1} value={digit}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^\d*$/.test(value)) {
                                                            const newOtp = [...otp];
                                                            newOtp[index] = value.slice(-1);
                                                            setotp(newOtp);
                                                            if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
                                                        }
                                                    }}
                                                    className="w-10 h-12 text-center text-xl font-black border border-gray-200 rounded-lg focus:border-black focus:outline-none bg-gray-50 transition-all"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {error && <p className="text-red-500 text-[10px] font-black uppercase mt-4 text-center tracking-wider">{error}</p>}

                                <button
                                    onClick={() => {
                                        if (step === "signup") sendOtp();
                                        else if (step === "login") handlelogin();
                                        else handleVerifyOtp();
                                    }}
                                    className="w-full bg-black text-white rounded-xl py-4 text-xs font-black uppercase tracking-widest mt-8 shadow-xl shadow-black/10 hover:bg-gray-900 transition-all disabled:opacity-20"
                                    disabled={loading}
                                >
                                    {loading ? "Please Wait..." : (step === "login" ? "Login" : (step === "signup" ? "Create Account" : "Verify OTP"))}
                                </button>
                            </motion.div>
                        </AnimatePresence>

                        <div className="text-center mt-8">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {step === "login" ? "New here? " : "Joined before? "}
                                <span onClick={() => setstep(step === "login" ? "signup" : "login")} className="text-black cursor-pointer hover:underline underline-offset-4">
                                    {step === "login" ? "Sign Up" : "Login"}
                                </span>
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default Authmodel