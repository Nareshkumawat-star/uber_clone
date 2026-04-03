'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, Lock, X } from 'lucide-react'
type steptype = "login" | "signup" | "otp"
function Authmodel({ open, onclose }: { open: boolean; onclose: () => void }) {
    const [step, setstep] = useState<steptype>("login")
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
                        className="relative w-full max-w-sm bg-white rounded-none p-12 overflow-hidden shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onclose}
                            className="absolute top-8 right-8 text-black/40 hover:text-black transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-black tracking-tighter uppercase mb-1 text-black">
                                Go<span className="opacity-20">Ride</span>
                            </h1>
                            <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest">Premium Vehicle Booking</p>
                        </div>

                        {/* Google Login */}
                        <button className="w-full bg-white border border-black/10 rounded-none py-4 flex items-center justify-center gap-3 hover:bg-black/5 transition-all mb-8 group shadow-sm">
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

                        {/* Welcome back */}
                        <h2 className="text-xl font-black tracking-tight mb-8 text-black">Welcome back</h2>

                        {/* Form */}
                        <div className="space-y-3">
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-focus-within:text-black transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full bg-black/5 border border-transparent focus:border-black/10 focus:bg-white rounded-none py-4 pl-14 pr-6 text-xs font-bold transition-all outline-none text-black"
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-focus-within:text-black transition-colors" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full bg-black/5 border border-transparent focus:border-black/10 focus:bg-white rounded-none py-4 pl-14 pr-6 text-xs font-bold transition-all outline-none text-black"
                                />
                            </div>
                        </div>

                        {/* Login Button */}
                        <button className="w-full bg-black text-white rounded-none py-5 text-sm font-black uppercase tracking-[0.2em] mt-8 hover:bg-black/90 transition-all shadow-xl shadow-black/20 active:scale-[0.98]">
                            Login
                        </button>

                        {/* Footer */}
                        <div className="text-center mt-10">
                            <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                                Don't have an account? <span className="text-black cursor-pointer hover:underline">Sign Up</span>
                            </p>
   <div>



                            {step=="login" (
                                <motion.div
                                initial={{opacity:0,y:20}}
                                 animate={{opacity:1,y:0}}
                               
                                 
                                >
                                    <motion.h2>Welcome back</motion.h2>
                                    <motion.p>Login to your account</motion.p>

                                </motion.div>
                            )
                                }

   </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default Authmodel