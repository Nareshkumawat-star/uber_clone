'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, Lock, X } from 'lucide-react'
import axios from 'axios'
import { signIn, useSession } from 'next-auth/react'
type steptype = "login" | "signup" | "otp"
function Authmodel({ open, onclose }: { open: boolean; onclose: () => void }) {
    const [step, setstep] = useState<steptype>("login")
    const [email, setemail] = useState("")
    const [password, setpassword] = useState("")
    const [name, setname] = useState("")
    const [mobileNumber, setMobileNumber] = useState("")
    const [loading, setloading] = useState(false)
    const [error, seterror] = useState("")
    const [otp , setotp] = useState(["","","","","",""])
 const data = useSession()
 console.log(data)
    const sendOtp = async () => {
        setloading(true)
        seterror("")
        try {
            const { data } = await axios.post("/api/auth/send-otp", { email })
            console.log(data)
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
            const { data } = await axios.post("/api/auth/register", {
                name, email, password, mobileNumber, code
            })
            console.log(data)
            setstep("login")
            seterror("")
            // Maybe show a success message?
        } catch (err: any) {
            seterror(err.response?.data?.message || "Invalid or expired OTP")
        } finally {
            setloading(false)
        }
    }

    const handlesignup = async () => {
        // Now handlesignup just sends OTP
        await sendOtp()
    }
    const handlelogin = async () => {
        setloading(true)
        seterror("")
        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false
            })
            console.log("Login Result:", res)
            if (res?.error) {
                seterror(res.error)
            } else {
                onclose() // Close modal on success
            }
        } catch (err: any) {
            seterror("An unexpected error occurred")
        } finally {
            setloading(false)
        }
    }
    const handlgoogle = async () => {
        await signIn("google")
    }
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onclose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-[90%] md:max-w-sm bg-white rounded-none p-8 md:p-12 overflow-hidden shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onclose}
                            className="absolute top-6 right-6 md:top-8 md:right-8 text-black/40 hover:text-black transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-10">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-1 text-black">
                                Go<span className="opacity-20">Ride</span>
                            </h1>
                            <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest">Premium Vehicle Booking</p>
                        </div>

                        {/* Google Login */}
                        <button className="w-full bg-white border border-black/10 rounded-none py-4 flex items-center justify-center gap-3 hover:bg-black/5 transition-all mb-8 group shadow-sm" onClick={handlgoogle}>
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span className="text-xs font-bold text-black/70">Continue with Google</span>
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-px flex-1 bg-black/10" />
                            <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest">OR</span>
                            <div className="h-px flex-1 bg-black/10" />
                        </div>

                        {/* Dynamic Content Based on Step */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Title */}
                                <h2 className="text-xl font-black tracking-tight mb-8 text-black">
                                    {step === "login" ? "Welcome back" : "Create account"}
                                </h2>

                                {/* Form */}
                                <div className="space-y-3">
                                    {step === "signup" && (
                                        <>
                                            <div className="relative group">
                                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-focus-within:text-black transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="Full Name"
                                                    className="w-full bg-black/5 border border-transparent focus:border-black/10 focus:bg-white rounded-none py-4 pl-14 pr-6 text-xs font-bold transition-all outline-none text-black"
                                                    onChange={(e)=>setname(e.target.value)} value={name} />
                                            </div>
                                            <div className="relative group">
                                                <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-focus-within:text-black transition-colors" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                                <input
                                                    type="text"
                                                    placeholder="Mobile Number (10 Digits)"
                                                    maxLength={10}
                                                    className="w-full bg-black/5 border border-transparent focus:border-black/10 focus:bg-white rounded-none py-4 pl-14 pr-6 text-xs font-bold transition-all outline-none text-black"
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                                        setMobileNumber(val);
                                                    }} value={mobileNumber} />
                                            </div>
                                        </>
                                    )}
                                    <div className="relative group">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-focus-within:text-black transition-colors" />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            className="w-full bg-black/5 border border-transparent focus:border-black/10 focus:bg-white rounded-none py-4 pl-14 pr-6 text-xs font-bold transition-all outline-none text-black"
                                       onChange={(e)=>setemail(e.target.value)} value={email} />
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-focus-within:text-black transition-colors" />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            className="w-full bg-black/5 border border-transparent focus:border-black/10 focus:bg-white rounded-none py-4 pl-14 pr-6 text-xs font-bold transition-all outline-none text-black"
                                       onChange={(e)=>setpassword(e.target.value)} value={password} />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-500 text-[10px] font-bold uppercase mt-4 text-center">{error}</p>
                                )}

                                {/* Action Button */}
                                {(() => {
                                    const isSignupValid = name.trim() !== "" && email.trim() !== "" && password.length >= 6 && mobileNumber.length === 10;
                                    const isLoginValid = email.trim() !== "" && password.trim() !== "";
                                    const isOtpValid = otp.every(digit => digit !== "");
                                    const isValid = step === "signup" ? isSignupValid : (step === "login" ? isLoginValid : isOtpValid);

                                    return (
                                        <motion.button
                                            disabled={loading || !isValid}
                                            initial={false}
                                            animate={{ 
                                                boxShadow: isValid && !loading ? "0 0 30px rgba(0,0,0,0.15)" : "0 0 0px rgba(0,0,0,0)",
                                                scale: isValid && !loading ? 1.02 : 1,
                                                backgroundColor: isValid && !loading ? "#000" : "rgba(0,0,0,0)",
                                                color: isValid && !loading ? "#fff" : "#00000040",
                                                borderColor: isValid && !loading ? "#000" : "#00000010"
                                            }}
                                            whileHover={isValid && !loading ? { scale: 1.03 } : {}}
                                            whileTap={isValid && !loading ? { scale: 0.98 } : {}}
                                            onClick={() => {
                                                if (step === "signup") {
                                                    handlesignup();
                                                } else if (step === "login") {
                                                    handlelogin();
                                                } else if (step === "otp") {
                                                    handleVerifyOtp();
                                                }
                                            }}
                                            className="w-full border-2 rounded-none py-5 text-sm font-black uppercase tracking-[0.2em] mt-8 transition-all disabled:cursor-not-allowed">
                                            {loading ? "Processing..." : (step === "login" ? "Login" : (step === "signup" ? "Sign Up" : "Verify OTP"))}
                                        </motion.button>
                                    );
                                })()}
                            </motion.div>
                        </AnimatePresence>

                        {/* Footer Content Based on Step */}
                        <div className="text-center mt-10">
                            {step === "login" && (
                                <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                                    Don't have an account? <span 
                                        onClick={() => setstep("signup")}
                                        className="text-black cursor-pointer hover:underline"
                                    >Sign Up</span>
                                </p>
                            )}
                            {step === "signup" && (
                                <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                                    Already have an account? <span 
                                        onClick={() => setstep("login")}
                                        className="text-black cursor-pointer hover:underline"
                                    >Login</span>
                                </p>
                            )}
                            {step === "otp" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6"
                                >
                                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest text-center">
                                        Enter the 6-digit code sent to your email
                                    </p>
                                    <div className="flex justify-center gap-2 mt-4">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^\d*$/.test(value)) {
                                                        const newOtp = [...otp];
                                                        newOtp[index] = value.slice(-1);
                                                        setotp(newOtp);
                                                        
                                                        // Auto-focus next input
                                                        if (value && index < 5) {
                                                            document.getElementById(`otp-${index + 1}`)?.focus();
                                                        }
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Backspace' && !otp[index] && index > 0) {
                                                        document.getElementById(`otp-${index - 1}`)?.focus();
                                                    }
                                                }}
                                                className="w-8 h-10 md:w-10 md:h-12 text-center text-lg md:text-xl font-black border-b-2 border-black/10 focus:border-black focus:outline-none bg-transparent transition-all"
                                            />
                                        ))}
                                    </div>
                                    <p 
                                        onClick={sendOtp}
                                        className="text-[10px] font-bold text-black border-b border-black/10 inline-block mt-6 cursor-pointer hover:border-black transition-all uppercase tracking-widest"
                                    >Resend Code</p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default Authmodel