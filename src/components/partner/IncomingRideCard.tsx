'use client'
import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { TrendingUp, Clock, MapPin } from 'lucide-react'

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
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[320px] z-50 bg-white border border-gray-100 rounded-2xl p-6 shadow-2xl overflow-hidden"
                >
                    {/* Compact Timer Bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-50">
                        <motion.div 
                            initial={{ width: '100%' }}
                            animate={{ width: `${(requestTimer / 20) * 100}%` }}
                            transition={{ duration: 1, ease: 'linear' }}
                            className="h-full bg-black"
                        />
                    </div>

                    <div className="flex items-center justify-between mb-4 mt-2">
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                             <p className="text-[10px] font-black uppercase tracking-widest text-black/40">New Request</p>
                        </div>
                        <p className="text-[10px] font-black text-black">{requestTimer}s</p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                            <div>
                                <h3 className="text-2xl font-black text-black tracking-tighter leading-none">{incomingRide.vehicle.price}</h3>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">{incomingRide.vehicle.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-black">2.4km</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Distance</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <MapPin size={12} className="shrink-0 mt-0.5" />
                                <p className="text-[11px] font-black text-black line-clamp-1">{incomingRide.pickupAddress?.split(',')[0]}</p>
                            </div>
                            <div className="flex gap-2">
                                <TrendingUp size={12} className="shrink-0 mt-0.5 text-gray-300" />
                                <p className="text-[11px] font-bold text-gray-400 line-clamp-1">{incomingRide.destinationAddress?.split(',')[0]}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => setIncomingRide(null)}
                            className="py-3 bg-gray-50 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                        >
                            Ignore
                        </button>
                        <button 
                            onClick={handleAcceptRide}
                            className="py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-lg"
                        >
                            Accept
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
