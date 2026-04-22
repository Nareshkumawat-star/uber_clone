'use client'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { io } from 'socket.io-client'
import { 
    LayoutDashboard, Car, FileText, Landmark, Settings, 
    LogOut, ChevronRight, Bell, User, Navigation, 
    MapPin, ExternalLink, ShieldCheck, CheckCircle2 
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import axios from 'axios'

export default function PartnerDashboard() {
  const { userdata } = useSelector((state: RootState) => state.user)
  const [isOnline, setIsOnline] = useState(false)
  const [activeRide, setActiveRide] = useState<any>(null)
  const [vehicleInfo, setVehicleInfo] = useState<any>(null)
  const [socket, setSocket] = useState<any>(null)
  const [rideRequest, setRideRequest] = useState<any>(null)
  const [currentCoords, setCurrentCoords] = useState<{lat: number, lon: number} | null>(null)

  const [rideStage, setRideStage] = useState<'EN_ROUTE' | 'ARRIVED' | 'ON_TRIP'>('EN_ROUTE')
  const [partnerOtp, setPartnerOtp] = useState('')
  const [expectedOtp, setExpectedOtp] = useState('')

  useEffect(() => {
    if (userdata?._id) {
        axios.get('/api/partner/onboard/vechile').then(res => {
            if (res.data?.vechile) {
                setVehicleInfo(res.data.vechile)
            }
        })
    }
  }, [userdata?._id])

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000')
    setSocket(socketInstance)

    socketInstance.on('new_ride_request', (data: any) => {
        // Double check online status
        setRideRequest(data)
    })

    socketInstance.on('ride_accepted', (data: any) => {
        if (data.otp) {
            setExpectedOtp(data.otp)
        }
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  // Manage Room based on Online status
  useEffect(() => {
    if (socket && isOnline) {
        socket.emit('join_partners')
    }
    // Note: We could add 'leave_partners' if needed, but disconnect handles it 
    // and server logic could be added to leave room.
  }, [socket, isOnline])

  // Track and send location when online and in a ride
  useEffect(() => {
    if (!isOnline) return

    const fetchLocation = () => {
        navigator.geolocation.getCurrentPosition((pos) => {
          const newCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude }
          setCurrentCoords(newCoords)
          
          if (socket && activeRide) {
            socket.emit('update_location', {
              rideId: activeRide.rideId,
              partnerId: userdata?._id,
              location: newCoords
            })
          }
        }, (err) => console.error("Geo error:", err), { enableHighAccuracy: true })
    }

    fetchLocation() // Initial fetch
    const interval = setInterval(fetchLocation, 3000)

    return () => clearInterval(interval)
  }, [isOnline, socket, activeRide, userdata?._id])

  const acceptRide = () => {
    if (!rideRequest || !socket) return
    
    // Join the specific ride room to communicate with rider
    socket.emit('join_ride', { rideId: rideRequest.rideId })

    socket.emit('accept_ride', {
      rideId: rideRequest.rideId,
      partnerId: userdata?._id,
      partnerLocation: currentCoords || { lat: 28.6139, lon: 77.2090 }, // Use real coords if available
      partnerName: userdata?.name || 'Partner',
      partnerPhone: userdata?.mobileNumber || '9999999999',
      vehicleModel: vehicleInfo?.vechileModel || 'Vehicle',
      vehicleNumber: vehicleInfo?.number || 'DL 01 AB 1234'
    })
    setActiveRide(rideRequest)
    setRideStage('EN_ROUTE')
    setRideRequest(null)
  }

  const markArrived = () => {
    setRideStage('ARRIVED')
    // Notify rider
    socket.emit('partner_location_update', {
        rideId: activeRide.rideId,
        location: { lat: 0, lon: 0 }, // Distance check in StatusContent will handle it, but we can force it
        forceArrival: true
    })
  }

  const verifyTripOtp = () => {
    // In demo, we accept 1234 or the real one
    if (partnerOtp === expectedOtp || partnerOtp === '1234') {
        setRideStage('ON_TRIP')
        socket.emit('start_trip', { rideId: activeRide.rideId })
    } else {
        alert("Invalid OTP! Check with rider.")
    }
  }

  const openInGoogleMaps = (lat: number, lon: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`, '_blank')
  }

  const stats = [
    { label: 'Total Earnings', value: '₹0.00', icon: Landmark },
    { label: 'Today\'s Rides', value: '0', icon: Car },
    { label: 'Rating', value: userdata?.role === 'partner' ? '5.0' : 'N/A', icon: User },
  ]

  const isApproved = userdata?.partneronbaordingsteps === 8;

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex">
      {/* Sidebar */}
      <div className="w-20 md:w-64 bg-white border-r border-gray-100 flex flex-col items-center py-10 transition-all">
        <h1 className="text-xl font-black text-black tracking-tighter mb-12 hidden md:block">
          Go<span className="opacity-20">Ride</span>
        </h1>
        
        <div className="flex-1 space-y-8">
          <div className="p-3 bg-black text-white rounded-2xl shadow-lg cursor-pointer">
            <LayoutDashboard size={20} />
          </div>
          <div className="p-3 text-gray-400 hover:text-black transition-colors cursor-pointer">
            <Car size={20} />
          </div>
          <div className="p-3 text-gray-400 hover:text-black transition-colors cursor-pointer">
            <FileText size={20} />
          </div>
          <div className="p-3 text-gray-400 hover:text-black transition-colors cursor-pointer">
            <Settings size={20} />
          </div>
        </div>

        <button 
          onClick={() => signOut()}
          className="mt-auto p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-all cursor-pointer"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-2xl font-black text-black tracking-tight">Partner Dashboard</h2>
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${isApproved ? 'text-emerald-500' : 'text-orange-500'}`}>
                Status: {isApproved ? 'Active' : 'Verification Pending'}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            {isApproved && (
                <div 
                    onClick={() => setIsOnline(!isOnline)}
                    className={`px-6 py-2 rounded-full cursor-pointer transition-all border-2 flex items-center gap-3 ${isOnline ? 'bg-black border-black text-white' : 'bg-white border-black/5 text-black'}`}
                >
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-300'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{isOnline ? 'Online' : 'Offline'}</span>
                </div>
            )}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50">
                <Bell size={18} />
              </div>
              <div className="h-10 px-4 bg-white border border-gray-100 rounded-full flex items-center gap-3 cursor-pointer hover:bg-gray-50">
                <div className="w-6 h-6 rounded-full bg-black/5" />
                <span className="text-[10px] font-black uppercase tracking-widest">{userdata?.name || 'My Account'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ride Request Modal/Alert */}
        <AnimatePresence>
            {rideRequest && (
                <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md bg-black text-white p-8 rounded-[3rem] shadow-2xl z-[100] border-4 border-white/10"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">New Ride Request</p>
                            <h3 className="text-xl font-black">{rideRequest.vehicleType.toUpperCase()} Request</h3>
                        </div>
                        <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold italic">
                            ₹{rideRequest.fare}
                        </div>
                    </div>
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <p className="text-[11px] font-bold text-white/80 line-clamp-1">{rideRequest.pickup}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-white/20" />
                            <p className="text-[11px] font-bold text-white/50 line-clamp-1">{rideRequest.dropoff}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setRideRequest(null)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest">Reject</button>
                        <button onClick={acceptRide} className="flex-1 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest">Accept</button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm"
            >
              <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-black mb-4">
                <stat.icon size={18} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-black">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Active Ride or Static Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black text-white p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group min-h-[300px]"
        >
          <div className="relative z-10">
            {!isApproved ? (
               <>
                <h3 className="text-3xl font-black mb-4 tracking-tighter">Your application is under review.</h3>
                <p className="text-gray-400 text-sm max-w-md font-medium leading-relaxed">
                  We're currently verifying your documents and bank details. This usually takes 24-48 hours. We'll notify you via email once you're ready to hit the road!
                </p>
               </>
            ) : activeRide ? (
               <div className="space-y-6">
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${rideStage === 'ON_TRIP' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                               <Car size={24} />
                           </div>
                           <div>
                               <h3 className="text-2xl font-black tracking-tight italic">
                                   {rideStage === 'EN_ROUTE' ? 'En Route to Pickup' : 
                                    rideStage === 'ARRIVED' ? 'At Pickup Point' : 'Trip in Progress'}
                               </h3>
                               <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                                   {rideStage === 'ON_TRIP' ? 'Destination: ' + activeRide.dropoff : 'Pickup: ' + activeRide.pickup}
                               </p>
                           </div>
                       </div>
                       <button 
                            onClick={() => openInGoogleMaps(
                                rideStage === 'EN_ROUTE' ? activeRide.location.lat : activeRide.destination.lat,
                                rideStage === 'EN_ROUTE' ? activeRide.location.lon : activeRide.destination.lon
                            )}
                            className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex items-center gap-2 transition-all"
                        >
                            <Navigation size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Navigate</span>
                       </button>
                   </div>

                   {rideStage === 'ARRIVED' ? (
                       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 p-8 rounded-[2rem] border border-white/10 space-y-6">
                            <div className="text-center space-y-2">
                                <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500">Awaiting Trip OTP</h4>
                                <p className="text-[10px] font-bold text-white/40">Ask the rider for their verification code</p>
                            </div>
                            <div className="flex justify-center">
                                <input
                                    type="text"
                                    maxLength={4}
                                    value={partnerOtp}
                                    onChange={(e) => setPartnerOtp(e.target.value)}
                                    placeholder="Enter 4-digit OTP"
                                    className="w-full max-w-[200px] h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-2xl font-black text-white focus:border-emerald-500 transition-all outline-none tracking-[0.5em]"
                                />
                            </div>
                            <button onClick={verifyTripOtp} className="w-full bg-emerald-500 text-white py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all">Start Trip</button>
                       </motion.div>
                   ) : (
                       <div className="grid gap-4 mt-8">
                           <div className="bg-white/5 p-6 rounded-3xl flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black text-white/20 uppercase mb-1">{rideStage === 'ON_TRIP' ? 'Dropoff' : 'Pickup'}</p>
                                    <p className="text-sm font-bold truncate max-w-[200px]">{rideStage === 'ON_TRIP' ? activeRide.dropoff : activeRide.pickup}</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl"><MapPin size={18} className="text-gray-400" /></div>
                           </div>
                           {rideStage === 'EN_ROUTE' && (
                               <button onClick={markArrived} className="w-full bg-white text-black py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest">I have Arrived</button>
                           )}
                           {rideStage === 'ON_TRIP' && (
                               <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20 flex items-center gap-4">
                                   <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white"><CheckCircle2 size={20} /></div>
                                   <div>
                                       <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Driving to destination</p>
                                       <p className="text-[9px] font-bold text-emerald-500/50">Follow navigation on your phone</p>
                                   </div>
                               </div>
                           )}
                       </div>
                   )}
               </div>
            ) : (
                <>
                <h3 className="text-3xl font-black mb-4 tracking-tighter">{isOnline ? 'Waiting for requests...' : 'You are currently offline.'}</h3>
                <p className="text-gray-400 text-sm max-w-md font-medium leading-relaxed">
                  {isOnline ? 'Stay on this page to receive the nearest ride requests in real-time.' : 'Go online to start receiving ride requests and tracking your earnings.'}
                </p>
                {!isOnline && (
                    <button onClick={() => setIsOnline(true)} className="mt-8 bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 cursor-pointer hover:scale-105 transition-all">
                      Go Online
                      <ChevronRight size={14} />
                    </button>
                )}
                </>
            )}
          </div>
          
          {/* Abstract decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/10 transition-all" />
        </motion.div>
      </div>
    </div>
  )
}
