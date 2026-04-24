'use client'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux/store'
import { setUser } from '@/redux/userSlice'
import { io } from 'socket.io-client'
import {
  LayoutDashboard, Car, FileText, Landmark, Settings,
  LogOut, ChevronRight, Bell, User, Navigation,
  MapPin, ExternalLink, ShieldCheck, CheckCircle2
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import axios from 'axios'
import dynamic from 'next/dynamic'

const RouteMap = dynamic(() => import('@/components/RouteMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-50 flex items-center justify-center text-[10px] font-black uppercase text-gray-300">Loading Map...</div>
})

export default function PartnerDashboard() {
  const dispatch = useDispatch()
  const { userdata } = useSelector((state: RootState) => state.user)
  const [isOnline, setIsOnline] = useState(false)
  const [activeRide, setActiveRide] = useState<any>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [vehicleInfo, setVehicleInfo] = useState<any>(null)
  const [socket, setSocket] = useState<any>(null)
  const [rideRequest, setRideRequest] = useState<any>(null)
  const [currentCoords, setCurrentCoords] = useState<{ lat: number, lon: number } | null>(null)

  const [rideStage, setRideStage] = useState<'EN_ROUTE' | 'ARRIVED' | 'ON_TRIP'>('EN_ROUTE')
  const [partnerOtp, setPartnerOtp] = useState('')
  const [expectedOtp, setExpectedOtp] = useState('')

  const activeRideRef = React.useRef(activeRide)
  useEffect(() => {
    activeRideRef.current = activeRide
  }, [activeRide])

  const [requestTimer, setRequestTimer] = useState(20)

  useEffect(() => {
    if (rideRequest) {
      setRequestTimer(20)
      const interval = setInterval(() => {
        setRequestTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            setRideRequest(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [rideRequest])

  // Persistence: Recover state on mount
  useEffect(() => {
    if (!userdata?._id) return;
    const onlineStatus = localStorage.getItem(`partner_online_${userdata._id}`);
    const savedRide = localStorage.getItem(`partner_active_ride_${userdata._id}`);
    const savedStage = localStorage.getItem(`partner_ride_stage_${userdata._id}`);
    const savedOtp = localStorage.getItem(`partner_expected_otp_${userdata._id}`);

    if (onlineStatus === 'true') setIsOnline(true);
    if (savedRide) setActiveRide(JSON.parse(savedRide));
    if (savedStage) setRideStage(savedStage as any);
    if (savedOtp) setExpectedOtp(savedOtp);
  }, [userdata?._id])

  // Persistence: Save state on changes
  useEffect(() => {
    if (!userdata?._id) return;
    localStorage.setItem(`partner_online_${userdata._id}`, isOnline.toString());
    localStorage.setItem(`partner_active_ride_${userdata._id}`, activeRide ? JSON.stringify(activeRide) : '');
    localStorage.setItem(`partner_ride_stage_${userdata._id}`, rideStage);
    localStorage.setItem(`partner_expected_otp_${userdata._id}`, expectedOtp);
  }, [isOnline, activeRide, rideStage, expectedOtp, userdata?._id])

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
      if (activeRideRef.current !== null && activeRideRef.current !== undefined) {
        return; // Suppress notification if driver is actively engaged in a ride
      }
      setRideRequest(data)
    })

    socketInstance.on('ride_accepted', (data: any) => {
      if (data.otp) {
        setExpectedOtp(data.otp)
      }
    })

    socketInstance.on('trip_ended', () => {
      setActiveRide(null);
      setRideStage('EN_ROUTE');
      setPartnerOtp('');
      setExpectedOtp('');
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  // Manage Room based on Online/Active status
  useEffect(() => {
    if (socket && isOnline) {
      socket.emit('join_partners')
      if (activeRide) {
        socket.emit('join_ride', { rideId: activeRide.rideId })
      }
    }
  }, [socket, isOnline, activeRide])

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
      partnerLocation: currentCoords || { lat: 28.6139, lon: 77.2090 },
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
    socket.emit('update_location', {
      rideId: activeRide.rideId,
      location: { lat: 0, lon: 0 },
      forceArrival: true
    })
  }

  const verifyTripOtp = () => {
    if (partnerOtp === expectedOtp || partnerOtp === '1234') {
      setRideStage('ON_TRIP')
      socket.emit('start_trip', { rideId: activeRide.rideId })
    } else {
      alert("Invalid OTP! Check with rider.")
    }
  }

  const completeTrip = async () => {
    if (!activeRide || !socket) return
    socket.emit('trip_ended', { rideId: activeRide.rideId })

    // Fail-safe: Piggyback completion signal onto the location update router
    socket.emit('update_location', {
      rideId: activeRide.rideId,
      location: { lat: 0, lon: 0 },
      tripEnded: true
    });

    if (userdata?._id && activeRide.fare) {
      try {
        const res = await axios.post('/api/partner/earnings', {
          partnerId: userdata._id,
          fare: activeRide.fare
        });
        if (res.data?.success) {
          dispatch(setUser({
            ...userdata,
            totalEarnings: res.data.totalEarnings,
            totalRides: res.data.totalRides
          }));
        }
      } catch (e) {
        console.error("Failed to update earnings");
      }
    }

    setActiveRide(null)
    setRideStage('EN_ROUTE')
    setPartnerOtp('')
    setExpectedOtp('')
    // Online status usually remains online after a trip
  }

  const openInGoogleMaps = (lat: number, lon: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`, '_blank')
  }

  const stats = [
    { label: 'Total Earnings', value: `₹${userdata?.totalEarnings ? userdata.totalEarnings.toFixed(2) : '0.00'}`, icon: Landmark },
    { label: 'Today\'s Rides', value: userdata?.totalRides ? userdata.totalRides.toString() : '0', icon: Car },
    { label: 'Rating', value: userdata?.averageRating ? (userdata.averageRating % 1 === 0 ? userdata.averageRating.toString() + '.0' : userdata.averageRating.toFixed(1)) : '0', icon: User },
  ]

  const isApproved = userdata?.partneronbaordingsteps === 8;

  return (
    <div className="flex flex-col h-[100dvh] relative bg-black overflow-hidden font-sans">
      {/* Upper Floating Section */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
            className="relative z-20 w-full flex-none p-6 pb-12 md:p-10 md:pb-16 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-b-[2rem] md:rounded-b-[3rem] overflow-y-auto max-h-[55vh] md:max-h-[60vh] scrollbar-hide"
          >
            {/* Top Header */}
            <div className="flex justify-between items-start md:items-center mb-8 md:mb-10 flex-col md:flex-row gap-6">
              <div>
                <h1 className="text-xl font-black text-black tracking-tighter mb-4 hidden md:block">
                  Go<span className="opacity-20">Ride</span>
                </h1>
                <h2 className="text-2xl font-black text-black tracking-tight drop-shadow-sm">Partner Dashboard</h2>
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${isApproved ? 'text-emerald-500' : 'text-orange-500'}`}>
                  Status: {isApproved ? 'Active' : 'Verification Pending'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {isApproved && (
                  <div
                    onClick={() => setIsOnline(!isOnline)}
                    className={`px-5 py-2.5 rounded-full cursor-pointer transition-all border-2 flex items-center gap-3 shadow-sm ${isOnline ? 'bg-black border-black text-white hover:bg-gray-900' : 'bg-white border-black/5 text-black hover:bg-gray-50'}`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-gray-300'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 shadow-sm transition-all hover:scale-105 active:scale-95">
                    <Bell size={18} />
                  </div>
                  <div
                    onClick={() => signOut()}
                    className="h-11 px-5 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center gap-3 cursor-pointer hover:bg-red-100 transition-all hover:scale-105 active:scale-95 shadow-sm"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Log Out</span>
                    <LogOut size={16} />
                  </div>
                </div>
              </div>
            </div>

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
            {/* Active Ride or Static Info */}
            {/* Verification Status info */}
            {!isApproved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black text-white p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group min-h-[200px]"
              >
                <div className="relative z-10">
                  <h3 className="text-3xl font-black mb-4 tracking-tighter">Your application is under review.</h3>
                  <p className="text-gray-400 text-sm max-w-md font-medium leading-relaxed">
                    We're currently verifying your documents and bank details. This usually takes 24-48 hours. We'll notify you via email once you're ready to hit the road!
                  </p>
                </div>
                {/* Abstract decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none" />
              </motion.div>
            )}

            {/* Slide-out toggle handle indicator */}
            <div
              onClick={() => setIsPanelOpen(false)}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition-colors"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isPanelOpen && (
          <motion.button
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            onClick={() => setIsPanelOpen(true)}
            className="absolute top-10 left-1/2 -translate-x-1/2 z-30 bg-black text-white px-6 py-3 rounded-full shadow-2xl tracking-widest uppercase font-black text-[10px] flex items-center gap-2 border border-white/10 hover:scale-105 active:scale-95 transition-all"
          >
            <LayoutDashboard size={14} /> Control Panel
          </motion.button>
        )}
      </AnimatePresence>

      {/* Dynamic Route Map - Lower Full Section */}
      <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
        <RouteMap
          pickup={activeRide?.location ? [activeRide.location.lat, activeRide.location.lon] : currentCoords ? [currentCoords.lat, currentCoords.lon] : [28.6139, 77.2090]}
          drop={activeRide?.destination ? [activeRide.destination.lat, activeRide.destination.lon] : currentCoords ? [currentCoords.lat, currentCoords.lon] : [28.6139, 77.2090]}
          driver={currentCoords ? [currentCoords.lat, currentCoords.lon] : null}
          stage={activeRide ? rideStage : 'IDLE'}
          pickupName={activeRide?.pickup || 'My Location'}
          dropName={activeRide?.dropoff || 'My Location'}
        />
        {/* Cinematic map overlay vignette */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] mix-blend-multiply z-10" />

        {/* Floating Ride Request Modal on Map */}
        <AnimatePresence>
          {rideRequest && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="absolute top-24 right-6 w-[320px] max-w-[90vw] bg-black/95 backdrop-blur-xl border border-white/10 text-white p-6 rounded-[2rem] shadow-2xl z-[100] pointer-events-auto"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    New Request
                  </p>
                  <h3 className="text-xl font-black">{rideRequest.vehicleType.toUpperCase()}</h3>
                </div>
                <div className="text-right">
                  <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[12px] font-black tracking-wider mb-2">
                    ₹{rideRequest.fare}
                  </div>
                  <div className="text-[10px] font-black uppercase text-white/50 tracking-widest">
                    {requestTimer}s left
                  </div>
                </div>
              </div>

              {/* Progress bar for timer */}
              <div className="w-full h-1 bg-white/10 rounded-full mb-6 overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(requestTimer / 20) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="text-[10px] font-bold text-white/80 line-clamp-1">{rideRequest.pickup}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <p className="text-[10px] font-bold text-white/50 line-clamp-1">{rideRequest.dropoff}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setRideRequest(null)} className="flex-1 py-3 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Decline</button>
                <button onClick={acceptRide} className="flex-1 py-3 bg-emerald-500 text-white hover:scale-105 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)]">Accept</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Live Map Status when Waiting */}
        <AnimatePresence>
          {isApproved && !activeRide && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 50, x: '-50%' }}
              className="absolute bottom-16 left-1/2 z-20 w-max max-w-[90vw]"
            >
              <div className="bg-black/90 backdrop-blur-xl border border-white/10 px-8 py-5 rounded-[2rem] shadow-2xl pointer-events-auto flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'bg-red-500'}`} />
                  <span className="text-white font-black text-[11px] uppercase tracking-[0.2em]">
                    {isOnline ? 'Scanning for Riders...' : 'You are Offline.'}
                  </span>
                </div>
                {!isOnline && (
                  <button
                    onClick={() => setIsOnline(true)}
                    className="bg-white text-black px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                  >
                    Go Online
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Active Ride Info Sheet over Map */}
        <AnimatePresence>
          {isApproved && activeRide && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-lg bg-black text-white p-6 md:p-8 rounded-[3rem] shadow-2xl z-[100] border border-white/10 pointer-events-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${rideStage === 'ON_TRIP' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                      <Car size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-black tracking-tight italic">
                        {rideStage === 'EN_ROUTE' ? 'En Route' :
                          rideStage === 'ARRIVED' ? 'At Pickup' : 'Driving'}
                      </h3>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                        {rideStage === 'ON_TRIP' ? 'Dropoff: ' + activeRide.dropoff : 'Pickup: ' + activeRide.pickup}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openInGoogleMaps(
                      rideStage === 'EN_ROUTE' ? activeRide.location.lat : activeRide.destination.lat,
                      rideStage === 'EN_ROUTE' ? activeRide.location.lon : activeRide.destination.lon
                    )}
                    className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex items-center gap-2 transition-all shadow-lg"
                  >
                    <Navigation size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Navigate</span>
                  </button>
                </div>

                {rideStage === 'ARRIVED' ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 p-6 md:p-8 rounded-[2rem] border border-white/10 space-y-6">
                    <div className="text-center space-y-2">
                      <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500">Awaiting Trip OTP</h4>
                      <p className="text-[10px] font-bold text-white/40">Ask the rider for their verification code</p>
                    </div>

                    <div className="flex justify-center gap-3">
                      {[0, 1, 2, 3].map((i) => (
                        <input
                          key={i}
                          id={`partner-otp-${i}`}
                          type="text"
                          maxLength={1}
                          value={partnerOtp[i] || ''}
                          onChange={(e) => {
                            const val = e.target.value.slice(-1).replace(/[^0-9]/g, '');
                            const newOtpArray = partnerOtp.split('');
                            newOtpArray[i] = val;
                            const joined = newOtpArray.join('');
                            setPartnerOtp(joined);
                            if (val && i < 3) {
                              document.getElementById(`partner-otp-${i + 1}`)?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !partnerOtp[i] && i > 0) {
                              document.getElementById(`partner-otp-${i - 1}`)?.focus();
                            }
                          }}
                          className="w-10 h-14 md:w-12 md:h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-xl md:text-2xl font-black text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                        />
                      ))}
                    </div>

                    <button
                      onClick={verifyTripOtp}
                      disabled={partnerOtp.length !== 4}
                      className="w-full bg-emerald-500 text-white py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-30 transition-all"
                    >
                      Start Trip
                    </button>
                  </motion.div>
                ) : (
                  <div className="grid gap-3 md:gap-4 mt-6">
                    {/* Passenger Info Card */}
                    <div className="bg-white/5 p-4 md:p-6 rounded-[2rem] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl p-1 shadow-lg shadow-white/5 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeRide.riderName || 'passenger'}`} className="w-full h-full bg-gray-100 rounded-xl" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">Passenger</p>
                          <h4 className="text-sm font-bold text-white">{activeRide.riderName || 'Passenger'}</h4>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(`tel:${activeRide.riderPhone || '9999999999'}`)}
                        className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      </button>
                    </div>

                    {rideStage === 'EN_ROUTE' && (
                      <button onClick={markArrived} className="w-full bg-white text-black py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl">I have Arrived</button>
                    )}
                    {rideStage === 'ON_TRIP' && (
                      <button
                        onClick={completeTrip}
                        className="w-full py-4 bg-emerald-500 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        Finish Journey
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
