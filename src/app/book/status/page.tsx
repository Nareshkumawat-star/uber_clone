'use client'
import React, { Suspense, useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import {
    MapPin, Navigation, ChevronLeft, ShieldCheck, Clock,
    Bike, Car, Truck, Phone, Star, Info, CheckCircle2, Lock, Check,
    MessageSquare, Send
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

import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

function StatusContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const { userdata } = useSelector((state: RootState) => state.user)

    const pickup = searchParams.get('pickup') || 'Pickup Point'
    const dropoff = searchParams.get('dropoff') || 'Destination'
    const vehicle = searchParams.get('vehicle') || 'bike'
    const plat = parseFloat(searchParams.get('plat') || '0')
    const plon = parseFloat(searchParams.get('plon') || '0')
    const dlat = parseFloat(searchParams.get('dlat') || '0')
    const dlon = parseFloat(searchParams.get('dlon') || '0')
    const fare = vehicle === 'bike' ? '45' : vehicle === 'auto' ? '70' : vehicle === 'car' ? '150' : '200'

    const currentRideId = `ride_${plat}_${dlat}`

    const [stage, _setStage] = useState<'SEARCHING' | 'ARRIVING' | 'OTP' | 'ON_TRIP' | 'COMPLETED'>('SEARCHING')
  const [requestSent, setRequestSent] = useState(false)
    const stageRef = useRef(stage)
    const setStage = (s: any) => {
        stageRef.current = s
        _setStage(s)
    }
    const [driverPos, setDriverPos] = useState<[number, number] | null>(null)
    const [driverInfo, setDriverInfo] = useState<any>(null)
    const [otp, setOtp] = useState('')
    const [rating, setRating] = useState(0)
    const [socket, setSocket] = useState<any>(null)

    const [messages, setMessages] = useState<{message: string, sender: 'me' | 'them', timestamp: Date}[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isAcknowledged, setIsAcknowledged] = useState(false)
    const [showCancelPopup, setShowCancelPopup] = useState(false)

    useEffect(() => {
        // 1. Recover state immediately on mount
        const savedStage = localStorage.getItem(`ride_stage_${currentRideId}`);
        const savedDriver = localStorage.getItem(`ride_driver_${currentRideId}`);
        const savedPos = localStorage.getItem(`ride_pos_${currentRideId}`);

        let initialStage: any = 'SEARCHING';
        if (savedStage) {
            initialStage = savedStage;
            setStage(savedStage as any);
            stageRef.current = savedStage as any;
        }
        if (savedDriver) setDriverInfo(JSON.parse(savedDriver));
        if (savedPos) setDriverPos(JSON.parse(savedPos));

        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000')
        setSocket(socketInstance)

        // 2. Emit ride request after socket connects (ensures request is sent)
        socketInstance.on('connect', () => {
            if (initialStage === 'SEARCHING') {
                socketInstance.emit('request_ride', {
                    rideId: currentRideId,
                    pickup,
                    dropoff,
                    fare,
                    vehicleType: vehicle,
                    location: { lat: plat, lon: plon },
                    destination: { lat: dlat, lon: dlon },
                    riderName: userdata?.name || 'Passenger',
                    riderPhone: userdata?.mobileNumber || 'XXXXXXXXXX'
                })
                setRequestSent(true)
            }
        })

        // Listen for confirmation that request was sent
        socketInstance.on('request_ride_ack', (data) => {
            console.log('Rider request ack received:', data)
            setIsAcknowledged(true)
        })

        // Keep other listeners unchanged
        socketInstance.emit('join_ride', { rideId: currentRideId })

        // 3. Only request ride if we are starting fresh in SEARCHING stage (fallback for older logic)
        if (initialStage === 'SEARCHING' && !requestSent) {
            socketInstance.emit('request_ride', {
                rideId: currentRideId,
                pickup,
                dropoff,
                fare,
                vehicleType: vehicle,
                location: { lat: plat, lon: plon },
                destination: { lat: dlat, lon: dlon },
                riderName: userdata?.name || 'Passenger',
                riderPhone: userdata?.mobileNumber || 'XXXXXXXXXX'
            })
            setRequestSent(true)
        }

        socketInstance.on('ride_accepted', (data: any) => {
            console.log("Ride accepted data received:", data);
            setStage('ARRIVING')
            setDriverInfo(data)
            setDriverPos([data.partnerLocation.lat, data.partnerLocation.lon])
            localStorage.setItem(`ride_stage_${currentRideId}`, 'ARRIVING');
            localStorage.setItem(`ride_driver_${currentRideId}`, JSON.stringify(data));
        })

        socketInstance.on('partner_location_update', (data: any) => {
            const currentStage = stageRef.current

            // Bypass processing if fail-safe tripEnded flag was passed
            if (data.tripEnded) {
                setStage('COMPLETED');
                localStorage.setItem(`ride_stage_${currentRideId}`, 'COMPLETED');
                return;
            }

            if (currentStage === 'COMPLETED') return; // Ignore updates if finished

            if (currentStage === 'ARRIVING' || data.forceArrival) {
                if (data.forceArrival) {
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

            if (data.location && data.location.lat !== 0) {
                const newPos: [number, number] = [data.location.lat, data.location.lon];
                setDriverPos(newPos);
                localStorage.setItem(`ride_pos_${currentRideId}`, JSON.stringify(newPos));
            }
        })

        socketInstance.on('trip_started', () => {
            setStage('ON_TRIP');
            localStorage.setItem(`ride_stage_${currentRideId}`, 'ON_TRIP');
        })

        socketInstance.on('trip_ended', () => {
            setStage('COMPLETED');
            localStorage.setItem(`ride_stage_${currentRideId}`, 'COMPLETED');
        })

        socketInstance.on('ride_cancelled', () => {
            setShowCancelPopup(true);
            setStage('SEARCHING');
            setDriverInfo(null);
            setRequestSent(false); // allow re-requesting
            localStorage.removeItem(`ride_stage_${currentRideId}`);
            localStorage.removeItem(`ride_driver_${currentRideId}`);
            localStorage.removeItem(`ride_pos_${currentRideId}`);
        })

        socketInstance.on('receive_message', (data: any) => {
            if (data.sender !== 'rider') {
                setMessages(prev => [...prev, { message: data.message, sender: 'them', timestamp: new Date(data.timestamp) }])
            }
        })

        return () => {
            socketInstance.disconnect()
        }
    }, [plat, plon, pickup, dropoff, userdata])

    // 4. Emit ride request when in SEARCHING stage and not yet sent
    useEffect(() => {
        if (stage !== 'SEARCHING' || !socket || requestSent) return;
        socket.emit('request_ride', {
            rideId: currentRideId,
            pickup,
            dropoff,
            fare,
            vehicleType: vehicle,
            location: { lat: plat, lon: plon },
            destination: { lat: dlat, lon: dlon },
            riderName: userdata?.name || 'Passenger',
            riderPhone: userdata?.mobileNumber || 'XXXXXXXXXX'
        });
        setRequestSent(true);
    }, [stage, socket, requestSent, currentRideId, pickup, dropoff, fare, vehicle, plat, plon, dlat, dlon, userdata])

    // 3. Periodic re-emission of ride request if still searching
    useEffect(() => {
        if (stage !== 'SEARCHING' || !socket) return;

        const interval = setInterval(() => {
            socket.emit('request_ride', {
                rideId: currentRideId,
                pickup,
                dropoff,
                fare,
                vehicleType: vehicle,
                location: { lat: plat, lon: plon },
                destination: { lat: dlat, lon: dlon },
                riderName: userdata?.name || 'Passenger',
                riderPhone: userdata?.mobileNumber || 'XXXXXXXXXX'
            });
        }, 8000); // Pulse every 8 seconds

        return () => clearInterval(interval);
    }, [stage, socket, currentRideId, pickup, dropoff, fare, vehicle, plat, plon, dlat, dlon, userdata])

    const handleOtpSubmit = () => {
        if (otp === '1234') {
            setStage('ON_TRIP')
        } else {
            alert("Invalid OTP. Use 1234 for demo.")
        }
    }

    const handleCancelRide = () => {
        if (!socket) return;
        socket.emit('cancel_ride', { rideId: currentRideId, source: 'rider' });
        
        localStorage.removeItem('current_ride_id');
        localStorage.removeItem(`ride_stage_${currentRideId}`);
        localStorage.removeItem(`ride_driver_${currentRideId}`);
        localStorage.removeItem(`ride_pos_${currentRideId}`);
        
        router.back();
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
                                    stage === 'OTP' ? 'Verification' :
                                        stage === 'ON_TRIP' ? 'Trip in Progress' : 'Trip Completed'}
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
                                    
                                    {isAcknowledged && (
                                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center mt-2">
                                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                                <CheckCircle2 size={12}/> Request Delivered
                                            </p>
                                        </motion.div>
                                    )}
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
                            <motion.div key="otp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-lg font-black uppercase tracking-tighter italic text-emerald-500">Driver has Arrived!</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Share this OTP with {driverInfo?.partnerName || 'your driver'} to start trip</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-black text-white p-10 rounded-[3rem] text-center space-y-4 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] relative z-10">Trip Verification Code</p>
                                        <h3 className="text-6xl font-black italic tracking-[0.2em] relative z-10 text-emerald-400">
                                            {driverInfo?.otp || '1234'}
                                        </h3>
                                        <div className="flex items-center justify-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest relative z-10">
                                            <Lock size={10} />
                                            <span>Secure verification</span>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20 text-center">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center justify-center gap-2">
                                            <CheckCircle2 size={14} />
                                            Verified Safety Shield Active
                                        </p>
                                    </div>
                                    <button 
                                        onClick={handleCancelRide}
                                        className="w-full bg-red-50 text-red-500 border border-red-100 p-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Cancel Ride
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
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
                                        <div className="w-14 h-14 bg-black rounded-2xl overflow-hidden shadow-lg border-2 border-white relative">
                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=driver" className="w-full h-full" />
                                            {stage === 'ARRIVING' && driverInfo?.otp && (
                                                <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white animate-pulse">
                                                    OTP
                                                </div>
                                            )}
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
                                            {stage === 'ARRIVING' && driverInfo?.otp && (
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-2 bg-emerald-50 w-max px-3 py-1 rounded-full border border-emerald-100 italic">
                                                    Your OTP: {driverInfo.otp}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => window.open(`tel:${driverInfo?.partnerPhone || '9999999999'}`)}
                                            className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                                            <Phone size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Chat Section */}
                                {(stage === 'ARRIVING' || stage === 'ON_TRIP') && (
                                    <div className="bg-white border border-black/5 rounded-[2.5rem] p-5 space-y-4 shadow-sm min-w-0">
                                        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2 mb-2">
                                            <MessageSquare size={12} /> Message Driver
                                        </h3>
                                        <div className="h-32 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                                            {messages.length === 0 ? (
                                                <div className="h-full flex items-center justify-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                                    No messages yet
                                                </div>
                                            ) : (
                                                messages.map((msg, idx) => (
                                                    <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${msg.sender === 'me' ? 'bg-black text-white rounded-tr-sm' : 'bg-gray-100 text-black rounded-tl-sm'}`}>
                                                            <p className="text-xs font-medium">{msg.message}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {["I'm waiting outside.", "Where are you?", "Please come fast.", "At the exact pin."].map((preset, i) => (
                                                <button 
                                                    key={i}
                                                    onClick={() => {
                                                        socket.emit('send_message', { rideId: currentRideId, message: preset, sender: 'rider' })
                                                        setMessages(prev => [...prev, { message: preset, sender: 'me', timestamp: new Date() }])
                                                    }}
                                                    className="whitespace-nowrap px-3 py-1.5 bg-gray-50 border border-black/5 rounded-full text-[10px] font-bold text-gray-500 hover:bg-black/5 hover:text-black transition-all active:scale-95"
                                                >
                                                    {preset}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex gap-2 relative">
                                            <input 
                                                type="text" 
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && newMessage.trim()) {
                                                        socket.emit('send_message', { rideId: currentRideId, message: newMessage, sender: 'rider' })
                                                        setMessages(prev => [...prev, { message: newMessage, sender: 'me', timestamp: new Date() }])
                                                        setNewMessage("")
                                                    }
                                                }}
                                                placeholder="Type a message..."
                                                className="flex-1 bg-gray-50 border border-black/5 rounded-full px-5 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black/5 min-w-0"
                                            />
                                            <button 
                                                onClick={() => {
                                                    if(newMessage.trim()){
                                                        socket.emit('send_message', { rideId: currentRideId, message: newMessage, sender: 'rider' })
                                                        setMessages(prev => [...prev, { message: newMessage, sender: 'me', timestamp: new Date() }])
                                                        setNewMessage("")
                                                    }
                                                }}
                                                className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center active:scale-95 transition-all flex-shrink-0"
                                            >
                                                <Send size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Trip Progress Indicator */}
                                <div className="bg-white border border-black/5 p-6 rounded-[2.5rem] space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-3 h-3 rounded-full mt-1.5 ${stage === 'ON_TRIP' || stage === 'COMPLETED' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-black'}`} />
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">{stage === 'ON_TRIP' || stage === 'COMPLETED' ? 'Currently at' : 'Pickup From'}</p>
                                            <p className="text-[11px] font-bold text-black/80">{pickup}</p>
                                        </div>
                                    </div>
                                    <div className="h-[1px] bg-black/5 ml-7" />
                                    <div className="flex items-start gap-4">
                                        <div className={`w-3 h-3 rotate-45 mt-1.5 ${stage === 'ON_TRIP' || stage === 'COMPLETED' ? 'bg-black' : 'bg-gray-100'}`} />
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

            {/* FULL SCREEN RATING MODAL POPUP */}
            <AnimatePresence>
                {stage === 'COMPLETED' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 pb-12"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 100 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 100 }}
                            className="bg-white w-full max-w-md rounded-[3rem] p-8 space-y-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="text-center space-y-4 relative z-10">
                                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-emerald-500/20">
                                    <CheckCircle2 size={48} className="text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black uppercase tracking-tighter italic text-black">Ride Completed!</h2>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-6">Rate your experience with {driverInfo?.partnerName || 'your driver'}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-black/5 space-y-8 shadow-sm relative z-10">
                                <div className="flex justify-center gap-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="group relative transition-all duration-300"
                                        >
                                            <Star
                                                size={42}
                                                fill={star <= rating ? "#000" : "none"}
                                                strokeWidth={1.5}
                                                className={`${star <= rating ? "text-black scale-110" : "text-gray-300"} transition-all group-active:scale-90`}
                                            />
                                            {star <= rating && (
                                                <motion.div
                                                    layoutId="star-glow"
                                                    className="absolute inset-0 bg-black/5 blur-xl rounded-full -z-10"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={async () => {
                                            if (driverInfo?.partnerId) {
                                                try {
                                                    await axios.post('/api/partner/rating', {
                                                        partnerId: driverInfo.partnerId,
                                                        rating: rating
                                                    });
                                                } catch (err) {
                                                    console.error("Failed to submit rating", err)
                                                }
                                            }
                                            router.push('/')
                                        }}
                                        className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all"
                                    >
                                        Submit Rating
                                    </button>
                                    <button
                                        onClick={() => router.push('/')}
                                        className="w-full py-4 text-black/40 hover:text-black rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-[0.98] transition-all"
                                    >
                                        Skip for now
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CUSTOM CANCEL POPUP */}
            <AnimatePresence>
                {showCancelPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2" />
                            
                            <div className="text-center relative z-10 space-y-4">
                                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100">
                                    <Info size={32} className="text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">Ride Cancelled</h2>
                                    <p className="text-[11px] font-bold text-gray-500 mt-2 leading-relaxed px-4">
                                        The partner had to cancel this trip. Don't worry, we are looking for a new driver for you!
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowCancelPopup(false)}
                                className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-[0.98] transition-all shadow-xl"
                            >
                                Continue Searching
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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
