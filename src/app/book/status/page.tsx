'use client'
import React, { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { MapPin, Navigation, ChevronLeft, ShieldCheck, Clock, Bike, Car, Truck, Phone, Map, Star, User, Info } from 'lucide-react'
import dynamic from 'next/dynamic'

const RouteMap = dynamic(() => import('@/components/RouteMap'), { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-50 animate-pulse flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-300">Loading Route...</div>
})

// Custom Auto Rickshaw Icon
const AutoIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1-3-4-3-4 3-4 3H3c-1.1 0-2 .9-2 2v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
        <path d="M7 10v4" />
        <path d="M11 7v3" />
    </svg>
)

function StatusContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    
    const pickup = searchParams.get('pickup') || 'Finding your location...'
    const dropoff = searchParams.get('dropoff') || 'Finding destination...'
    const vehicle = searchParams.get('vehicle') || 'bike'
    const plat = searchParams.get('plat')
    const plon = searchParams.get('plon')
    const dlat = searchParams.get('dlat')
    const dlon = searchParams.get('dlon')

    // Simulated status
    const [status, setStatus] = useState<'SEARCHING' | 'ACCEPTED'>('SEARCHING')
    useEffect(() => {
        const timer = setTimeout(() => setStatus('ACCEPTED'), 5000)
        return () => clearTimeout(timer)
    }, [])

    const fare = vehicle === 'bike' ? '45' : vehicle === 'auto' ? '70' : vehicle === 'car' ? '150' : '200'

    // Map URL construction
    let mapUrl = `https://www.openstreetmap.org/export/embed.html?layer=mapnik`
    if (plat && plon && dlat && dlon) {
        const minLat = Math.min(parseFloat(plat), parseFloat(dlat)) - 0.015
        const maxLat = Math.max(parseFloat(plat), parseFloat(dlat)) + 0.015
        const minLon = Math.min(parseFloat(plon), parseFloat(dlon)) - 0.015
        const maxLon = Math.max(parseFloat(plon), parseFloat(dlon)) + 0.015
        mapUrl += `&bbox=${minLon},${minLat},${maxLon},${maxLat}`
    } else if (plat && plon) {
        mapUrl += `&bbox=${parseFloat(plon)-0.015},${parseFloat(plat)-0.015},${parseFloat(plon)+0.015},${parseFloat(plat)+0.015}`
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans text-black">
            {/* STICKY HEADER */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2.5 hover:bg-black/5 rounded-full transition-all active:scale-95 text-gray-400 hover:text-black">
                        <ChevronLeft size={22} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h1 className="text-lg font-black tracking-tight uppercase">Trip Details</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Booking Status</p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-emerald-500">
                    <ShieldCheck size={20} />
                </div>
            </div>

            <main className="max-w-2xl mx-auto pb-40">
                <section className="h-[40vh] relative border-b border-black/5 overflow-hidden">
                    {plat && plon && dlat && dlon ? (
                        <RouteMap 
                            pickup={[parseFloat(plat), parseFloat(plon)]} 
                            drop={[parseFloat(dlat), parseFloat(dlon)]} 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[10px] font-black uppercase text-gray-300">
                            Waiting for coords...
                        </div>
                    )}
                </section>

                <div className="p-6 space-y-6">
                    {/* STATUS / DRIVER SECTION */}
                    <AnimatePresence mode="wait">
                        {status === 'SEARCHING' ? (
                            <motion.div 
                                key="searching"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-black text-white p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <Navigation size={40} />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                        <Clock size={24} className="animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-tight">Searching for your ride...</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Connecting to local riders</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="accepted"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white border border-black/5 p-6 rounded-[2.5rem] shadow-sm flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-black rounded-3xl overflow-hidden shadow-xl">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=driver" className="w-full h-full p-1" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black uppercase tracking-tight">Naresh Kumar</h3>
                                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                            <Star size={10} fill="currentColor" />
                                            4.9 • UP 93 AB 9999
                                        </p>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl">
                                    <Phone size={20} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ROUTE INFORMATION */}
                    <div className="bg-white border border-black/5 rounded-[2.5rem] p-8 shadow-sm space-y-8">
                        <div className="space-y-8 relative">
                            <div className="absolute left-[7.5px] top-[14px] bottom-[14px] w-[2px] bg-black/5" />
                            
                            <div className="flex items-start gap-5 relative">
                                <div className="w-4 h-4 rounded-full bg-black ring-4 ring-black/5 z-10 mt-1" />
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pickup From</p>
                                    <p className="text-[11px] font-bold leading-relaxed">{pickup}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-5 relative">
                                <div className="w-4 h-4 bg-black ring-4 ring-black/5 rotate-45 z-10 mt-1" />
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Destination To</p>
                                    <p className="text-[11px] font-bold leading-relaxed">{dropoff}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FARE INFORMATION */}
                    <div className="bg-black text-white rounded-[2.5rem] p-8 shadow-2xl flex items-center justify-between group relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Total Estimated Fare</p>
                            <div className="flex items-end gap-2">
                                <h2 className="text-4xl font-black italic tracking-tighter">₹{fare}</h2>
                                <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-1.5">Cash/Online</span>
                            </div>
                        </div>
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md relative z-10 border border-white/5 shadow-inner">
                             {vehicle === 'auto' ? <AutoIcon className="w-10 h-10" /> : 
                                 vehicle === 'bike' ? <Bike size={32} /> : 
                                 vehicle === 'car' ? <Car size={32} /> : <Truck size={32} />}
                        </div>
                        {/* Static background shine */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>

                    <div className="bg-emerald-50/50 rounded-3xl p-4 border border-emerald-100 flex items-center gap-3">
                        <Info size={16} className="text-emerald-500" />
                        <p className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-widest">Pricing includes platform fees & taxes</p>
                    </div>

                    <div className="text-center pt-4">
                        <button onClick={() => router.back()} className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] hover:text-red-500 transition-colors py-2">
                             Cancel current booking
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function BookingStatusPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-white font-black uppercase tracking-widest text-gray-300">Initializing Ride...</div>}>
            <StatusContent />
        </Suspense>
    )
}
