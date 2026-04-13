'use client'
import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { TrendingUp } from 'lucide-react'

interface IncomingRideCardProps {
    incomingRide: any;
    requestTimer: number;
    handleAcceptRide: () => void;
    setIncomingRide: (val: any) => void;
}

export default function IncomingRideCard({ incomingRide, requestTimer, handleAcceptRide, setIncomingRide }: IncomingRideCardProps) {
    return (
        <AnimatePresence>
            {incomingRide && (
                <motion.div 
                    initial={{ opacity: 0, x: -100, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -100, scale: 0.9 }}
                    className="absolute left-8 top-32 z-30 w-full max-w-[340px] bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
                        <motion.div 
                            initial={{ width: '100%' }}
                            animate={{ width: `${(requestTimer / 20) * 100}%` }}
                            transition={{ duration: 1, ease: 'linear' }}
                            className="h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                        />
                    </div>

                    <div className="flex items-center justify-between mb-8">
                        <div className="bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{requestTimer}s Remaining</p>
                        </div>
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                            <TrendingUp className="text-white/40" size={18} />
                        </div>
                    </div>

                    <div className="space-y-6 mb-10">
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tighter mb-1">{incomingRide.vehicle.price}</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">{incomingRide.vehicle.name}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center gap-1 mt-1">
                                    <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 shrink-0" />
                                    <div className="w-0.5 h-8 bg-dashed border-l-2 border-dashed border-white/10" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                                </div>
                                <div className="space-y-4 pt-0.5">
                                    <p className="text-xs font-bold text-white leading-snug line-clamp-1 opacity-80">{incomingRide.pickupAddress}</p>
                                    <p className="text-xs font-bold text-white leading-snug line-clamp-1 opacity-80">{incomingRide.destinationAddress}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-6 pt-2">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Distance</p>
                                <p className="text-sm font-black text-white">{incomingRide.distance || '2.4 km'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Time</p>
                                <p className="text-sm font-black text-white">{incomingRide.time || '8 mins'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setIncomingRide(null)}
                            className="py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all"
                        >
                            Decline
                        </button>
                        <button 
                            onClick={handleAcceptRide}
                            className="py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/10"
                        >
                            Accept
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
