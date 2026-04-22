'use client'
import React, { Suspense, useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { 
    MapPin, Navigation, ChevronLeft, ShieldCheck, Clock, 
    Bike, Car, Truck, Phone, Star, Info, CheckCircle2, Lock 
} from 'lucide-react'
import dynamic from 'next/dynamic'

const RouteMap = dynamic(() => import('@/components/RouteMap'), { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-50 animate-pulse flex items-center justify-center text-[10px] font-black uppercase text-gray-300">Loading Route Map...</div>
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

import { io } from 'socket.io-client'

function StatusContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    
    const pickup = searchParams.get('pickup') || 'Pickup Point'
    const dropoff = searchParams.get('dropoff') || 'Destination'
    const vehicle = searchParams.get('vehicle') || 'bike'
    const plat = parseFloat(searchParams.get('plat') || '0')
    const plon = parseFloat(searchParams.get('plon') || '0')
    const dlat = parseFloat(searchParams.get('dlat') || '0')
    const dlon = parseFloat(searchParams.get('dlon') || '0')
    const fare = vehicle === 'bike' ? '45' : vehicle === 'auto' ? '70' : vehicle === 'car' ? '150' : '200'

    const [stage, _setStage] = useState<'SEARCHING' | 'ARRIVING' | 'OTP' | 'ON_TRIP'>('SEARCHING')
    const stageRef = useRef(stage)
    const setStage = (s: any) => {
        stageRef.current = s
        _setStage(s)
    }
    const [driverPos, setDriverPos] = useState<[number, number] | null>(null)
    const [driverInfo, setDriverInfo] = useState<any>(null)
    const [otp, setOtp] = useState('')
    const [socket, setSocket] = useState<any>(null)

    useEffect(() => {
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000')
        setSocket(socketInstance)
        // Stable Ride ID based on coords to survive refreshes
        const currentRideId = `ride_${plat}_${dlat}`

        socketInstance.emit('join_ride', { rideId: currentRideId })

        // Emit actual ride request to all partners
        socketInstance.emit('request_ride', {
            rideId: currentRideId,
            pickup,
            dropoff,
            fare,
            vehicleType: vehicle,
            location: { lat: plat, lon: plon },
            destination: { lat: dlat, lon: dlon }
        })

        socketInstance.on('ride_accepted', (data: any) => {
            setStage('ARRIVING')
            setDriverInfo(data)
            setDriverPos([data.partnerLocation.lat, data.partnerLocation.lon])
            localStorage.setItem(`ride_stage_${currentRideId}`, 'ARRIVING');
            localStorage.setItem(`ride_driver_${currentRideId}`, JSON.stringify(data));
        })

        socketInstance.on('partner_location_update', (data: any) => {
            const currentStage = stageRef.current
            // Check for arrival first (independent of position state)
            if (currentStage === 'ARRIVING' || data.forceArrival) {
                if (data.forceArrival) {
                    console.log('Force arrival received, showing OTP');
                    setStage('OTP');
                    localStorage.setItem(`ride_stage_${currentRideId}`, 'OTP');
                    return;
                }
                
                const dist = (data.location && data.location.lat !== 0) ? Math.sqrt(Math.pow(data.location.lat - plat, 2) + Math.pow(data.location.lon - plon, 2)) : 999;
                if (dist < 0.001) {
                    setStage('OTP');
                    localStorage.setItem(`ride_stage_${currentRideId}`, 'OTP');
                }
            }

            // Then update position
            if (data.location && data.location.lat !== 0) {
                const newPos: [number, number] = [data.location.lat, data.location.lon];
                setDriverPos(newPos);
                localStorage.setItem(`ride_pos_${currentRideId}`, JSON.stringify(newPos));
            }
        })

        socketInstance.on('trip_started', () => {
            console.log('Trip started received!');
            setStage('ON_TRIP');
            localStorage.setItem(`ride_stage_${currentRideId}`, 'ON_TRIP');
        })

        // On Mount: Recover state if possible
        const savedStage = localStorage.getItem(`ride_stage_${currentRideId}`);
        const savedDriver = localStorage.getItem(`ride_driver_${currentRideId}`);
        const savedPos = localStorage.getItem(`ride_pos_${currentRideId}`);
        
        if (savedStage) {
            setStage(savedStage as any);
            stageRef.current = savedStage as any;
        }
        if (savedDriver) setDriverInfo(JSON.parse(savedDriver));
        if (savedPos) setDriverPos(JSON.parse(savedPos));

        return () => {
            socketInstance.disconnect()
        }
    }, [plat, plon, pickup, dropoff])

    const handleOtpSubmit = () => {
        if (otp === '1234') {
            setStage('ON_TRIP')
        } else {
            alert("Invalid OTP. Use 1234 for demo.")
        }
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans text-black overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-black/5 p-5 flex items-center justify-between z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-black/5 rounded-full transition-all active:scale-95">
                        <ChevronLeft size={22} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-tight">
                            {stage === 'SEARCHING' ? 'Finding Ride...' : 
                             stage === 'ARRIVING' ? 'Driver Arriving' : 
                             stage === 'OTP' ? 'Verification' : 'Trip in Progress'}
                        </h1>
                    </div>
                </div>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stage === 'ON_TRIP' ? 'bg-emerald-500 text-white' : 'bg-black/5 text-gray-400'}`}>
                    <ShieldCheck size={18} />
                </div>
            </div>

            <main className="flex-1 flex flex-col relative">
                {/* DYNAMIC MAP SECTION */}
                <div className="h-[45vh] relative overflow-hidden transition-all duration-1000">
                    <RouteMap 
                        pickup={[plat, plon]} 
                        drop={[dlat, dlon]} 
                        driver={driverPos}
                        stage={stage}
                        pickupName={pickup}
                        dropName={dropoff}
                    />
                </div>

                {/* SLIDING BOTTOM PANEL */}
                <div className="flex-1 bg-white rounded-t-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.1)] p-6 -mt-10 relative z-40 space-y-6">
                    <AnimatePresence mode="wait">
                        {stage === 'SEARCHING' ? (
                            <motion.div 
                                key="searching" 
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8 py-4"
                            >
                                <div className="text-center space-y-3">
                                    <div className="relative w-20 h-20 mx-auto mb-6">
                                        <div className="absolute inset-0 bg-black/5 rounded-full animate-ping" />
                                        <div className="absolute inset-0 bg-black/10 rounded-full animate-pulse delay-75" />
                                        <div className="relative w-20 h-20 bg-black rounded-full flex items-center justify-center text-white shadow-2xl">
                                            {vehicle === 'bike' ? <Bike size={32} /> : vehicle === 'auto' ? <AutoIcon className="w-10 h-10" /> : <Car size={32} />}
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-black uppercase tracking-tighter italic">Finding your driver</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Contacting nearby {vehicle} partners...</p>
                                </div>

                                {/* Premium Progress Bar */}
                                <div className="relative h-1.5 bg-black/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ left: '-100%' }}
                                        animate={{ left: '100%' }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                        className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-black to-transparent"
                                    />
                                </div>

                                <div className="bg-gray-50 p-6 rounded-[2rem] border border-black/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm"><ShieldCheck size={20} className="text-emerald-500" /></div>
                                        <p className="text-[10px] font-black uppercase tracking-tight text-black/60">Safety verified partners only</p>
                                    </div>
                                    <button onClick={() => router.back()} className="text-[9px] font-black uppercase text-red-500 tracking-widest hover:bg-red-50 px-4 py-2 rounded-full transition-colors">Cancel</button>
                                </div>
                            </motion.div>
                        ) : stage === 'OTP' ? (
                            <motion.div key="otp" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-lg font-black uppercase tracking-tighter italic text-emerald-500">Driver has Arrived!</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Share OTP with {driverInfo?.partnerName || 'Rider'} to start</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-black/5 p-8 rounded-[2rem] border-2 border-dashed border-black/10 text-center space-y-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Share this code with your driver</p>
                                        <div className="flex justify-center gap-4">
                                            {(driverInfo?.otp || '----').split('').map((char: string, i: number) => (
                                                <div key={i} className="w-14 h-18 bg-white shadow-xl rounded-2xl flex items-center justify-center text-3xl font-black text-black border border-black/5">
                                                    {char}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 text-center">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center justify-center gap-2">
                                            <ShieldCheck size={14} />
                                            Safe & Verified Trip
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="info" initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-6">
                                {stage === 'ON_TRIP' && (
                                    <motion.div 
                                        initial={{ y: -10, opacity: 0 }} 
                                        animate={{ y: 0, opacity: 1 }}
                                        className="bg-emerald-600 p-5 rounded-[2rem] flex items-center gap-4 shadow-xl shadow-emerald-500/20"
                                    >
                                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                            <Check size={20} className="text-white" strokeWidth={3} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase text-white tracking-widest italic">Trip Started Successfully</p>
                                            <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Enjoy your premium ride</p>
                                        </div>
                                    </motion.div>
                                )}
                                {/* Driver Info Card */}
                                <div className="flex items-center justify-between bg-gray-50/50 p-6 rounded-[2.5rem] border border-black/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-black rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=driver" className="w-full h-full" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black uppercase tracking-tight italic">{driverInfo?.partnerName || 'Naresh Kumar'}</h3>
                                            <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-wider mt-1">
                                                <div className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Star size={8} fill="currentColor" /> 4.9
                                                </div>
                                                <span className="opacity-30">•</span>
                                                <span className="text-black font-black">{driverInfo?.vehicleModel || (vehicle === 'bike' ? 'Royal Enfield' : 'Swift Dzire')}</span>
                                                <span className="opacity-30">•</span>
                                                <span className="text-black font-black">{driverInfo?.vehicleNumber || 'UP 93 AB 9999'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => window.open(`tel:${driverInfo?.partnerPhone || '9999999999'}`)}
                                            className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-xl">
                                            <Phone size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Trip Progress Indicator */}
                                <div className="bg-white border border-black/5 p-6 rounded-[2.5rem] space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-3 h-3 rounded-full mt-1.5 ${stage === 'ON_TRIP' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-black'}`} />
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">{stage === 'ON_TRIP' ? 'Currently at' : 'Pickup From'}</p>
                                            <p className="text-[11px] font-bold text-black/80">{pickup}</p>
                                        </div>
                                    </div>
                                    <div className="h-[1px] bg-black/5 ml-7" />
                                    <div className="flex items-start gap-4">
                                        <div className={`w-3 h-3 rotate-45 mt-1.5 ${stage === 'ON_TRIP' ? 'bg-black' : 'bg-gray-100'}`} />
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Destination To</p>
                                            <p className="text-[11px] font-bold text-black/80">{dropoff}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Fare/Amount */}
                                <div className="bg-black text-white p-7 rounded-[2.5rem] flex items-center justify-between shadow-2xl relative shadow-black/20">
                                    <div>
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Total to Pay</p>
                                        <h2 className="text-3xl font-black italic tracking-tighter">₹{fare} <span className="text-[11px] non-italic font-bold opacity-30">CASH</span></h2>
                                    </div>
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/5">
                                         {vehicle === 'auto' ? <AutoIcon className="w-8 h-8" /> : 
                                         vehicle === 'bike' ? <Bike size={24} /> : <Car size={24} />}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
}

export default function BookingStatusPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-white">Loading Trip...</div>}>
            <StatusContent />
        </Suspense>
    )
}
