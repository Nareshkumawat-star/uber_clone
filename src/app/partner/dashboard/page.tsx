'use client'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Car, Landmark, LogOut, Bell, User, MapPin as MapPinIcon, ChevronRight, ChevronLeft, Zap, Target, ArrowUpRight, Wallet, Settings, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useSocket } from '@/components/SocketProvider'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import IncomingRideCard from '@/components/partner/IncomingRideCard'
import ActiveTripOverlay from '@/components/partner/ActiveTripOverlay'

const LiveMap = dynamic(() => import('@/components/LiveMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-50 animate-pulse rounded-xl" />
})

export default function PartnerDashboard() {
  const { socket, isConnected } = useSocket()
  const [incomingRide, setIncomingRide] = useState<any>(null)
  const [activeRide, setActiveRide] = useState<any>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number }| null>(null)
  const [requestTimer, setRequestTimer] = useState(20)
  const [otpInput, setOtpInput] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [tripStatus, setTripStatus] = useState<'approaching' | 'ongoing' | 'completed'>('approaching')
  const [isSimulating, setIsSimulating] = useState(false)

  const stats = [
    { label: 'Balance', value: '₹0', icon: Wallet },
    { label: "Today", value: '0 Rides', icon: Car },
    { label: "Online", value: '0h', icon: Zap },
  ]

  useEffect(() => {
    if (!socket) return;
    socket.on('new_ride_request', (data) => setIncomingRide(data));
    socket.on('ride_accepted', (data) => {
      if (activeRide && !activeRide.otp) {
        setActiveRide((prev: any) => ({ ...prev, otp: data.otp }));
      }
    });
    return () => {
      socket.off('new_ride_request');
      socket.off('ride_accepted');
    };
  }, [socket, activeRide]);

  useEffect(() => {
    const savedState = localStorage.getItem('partnerRideState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.activeRide) {
          setActiveRide(parsed.activeRide);
          setTripStatus(parsed.tripStatus || 'approaching');
          setIsVerified(parsed.isVerified || false);
          setOtpInput(parsed.otpInput || '');
        }
      } catch (e) { }
    }
  }, []);

  useEffect(() => {
    if (activeRide) {
      localStorage.setItem('partnerRideState', JSON.stringify({ activeRide, tripStatus, isVerified, otpInput }));
    } else {
      localStorage.removeItem('partnerRideState');
    }
  }, [activeRide, tripStatus, isVerified, otpInput]);

  useEffect(() => {
    let interval: any;
    if (incomingRide && requestTimer > 0) {
      interval = setInterval(() => setRequestTimer((prev) => prev - 1), 1000);
    } else if (requestTimer === 0) {
      setIncomingRide(null);
      setRequestTimer(20);
    }
    return () => clearInterval(interval);
  }, [incomingRide, requestTimer]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      null, { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleAcceptRide = () => {
    if (!socket || !incomingRide) return;
    socket.emit('accept_ride', {
      ...incomingRide,
      partner: {
        name: 'Amit Kumar',
        rating: '5.0',
        phone: '+91 91122 33445',
        img: 'https://ui-avatars.com/api/?name=Amit+Kumar&background=000&color=fff'
      }
    });
    setActiveRide(incomingRide);
    setIncomingRide(null);
    setTripStatus('approaching');
    setRequestTimer(20);
  };

  const handleVerifyOtp = () => {
    if (otpInput === activeRide?.otp) {
      setIsVerified(true);
      setTripStatus('ongoing');
      if (socket) socket.emit('trip_started', { rideId: activeRide.id || activeRide.otp });
    } else { alert("Invalid OTP"); }
  };

  const [isMinimized, setIsMinimized] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-[100dvh] bg-white text-black flex flex-col font-sans overflow-hidden">
      
      {/* Small Header */}
      <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0 z-50 bg-white">
          <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <Zap className="text-white w-4 h-4" />
              </div>
              <h1 className="text-lg font-black tracking-tighter">Partner</h1>
          </div>
          <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4 mr-4">
                   <p className="text-[10px] font-black uppercase text-gray-400">Online</p>
                   <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
              </div>
              <button onClick={() => signOut()} className="text-gray-400 hover:text-black transition-colors"><LogOut size={18} /></button>
          </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 relative bg-gray-50">
          <div className="absolute inset-0 z-0">
              <LiveMap
                  currentLocation={currentLocation}
                  rideRequestLocation={incomingRide?.pickupCoords || activeRide?.pickupCoords}
                  destinationLocation={activeRide?.destinationCoords}
                  hideDestinationInfo={!isVerified && !!activeRide}
              />
          </div>

          <div className="absolute top-4 right-4 z-20">
              <div onClick={() => currentLocation && setCurrentLocation({ ...currentLocation })} className="w-10 h-10 bg-white text-black rounded-xl border border-gray-100 flex items-center justify-center cursor-pointer shadow-lg active:bg-gray-50">
                  <MapPinIcon size={18} />
              </div>
          </div>

          {/* Floating Action Button (FAB) for Map-Only Mode (Mobile) */}
          <AnimatePresence>
              {windowWidth < 768 && isMinimized && (
                  <motion.button 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={() => setIsMinimized(false)}
                    className="absolute bottom-10 right-4 z-[50] pointer-events-auto bg-black text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-black uppercase text-[10px] tracking-widest border-2 border-white/10"
                  >
                      <Zap size={14} /> Stats & Info
                  </motion.button>
              )}
          </AnimatePresence>

          {/* Floating Panels: Draggable on Mobile */}
          <motion.div 
              className="absolute inset-x-0 bottom-0 md:relative md:inset-auto md:w-[360px] md:h-full z-40 p-4 pointer-events-none flex flex-col justify-end md:justify-start"
              initial={false}
              animate={{ 
                  y: windowWidth < 768 && isMinimized && !activeRide ? '95%' : '0%' 
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden pointer-events-auto max-h-[75vh] md:max-h-none flex flex-col">
                  {/* Pull handle */}
                  <div 
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="w-full h-10 flex flex-col items-center justify-center cursor-pointer md:hidden group relative"
                  >
                      <div className="w-12 h-1 bg-gray-200 rounded-full group-hover:bg-gray-400 transition-colors" />
                      <motion.div 
                        animate={{ rotate: isMinimized ? 180 : 0 }}
                        className="absolute right-6 text-gray-300"
                      >
                         <ChevronLeft className="-rotate-90" size={16} />
                      </motion.div>
                      {isMinimized && !activeRide && (
                          <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mt-2">Tap to view stats</p>
                      )}
                  </div>
                  
                  <div className={`flex-1 overflow-y-auto scrollbar-hide p-4 md:p-6 space-y-4 transition-opacity duration-300 ${isMinimized && !activeRide ? 'opacity-0' : 'opacity-100'}`}>
                      {/* Status Card */}
                      {!activeRide && (
                          <div className="p-4 bg-black text-white rounded-xl">
                              <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">System</p>
                              <h2 className="text-base font-black">Active & Ready</h2>
                          </div>
                      )}

                      {/* Stats Grid - Smaller on Mobile */}
                      {!activeRide && (
                          <div className="grid grid-cols-3 gap-2">
                              {stats.map((s, i) => (
                                  <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                      <p className="text-[10px] font-black">{s.value}</p>
                                      <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                                  </div>
                              ))}
                          </div>
                      )}

                      {/* Active Ride Card */}
                      <AnimatePresence mode="wait">
                          {activeRide ? (
                              <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                                  <ActiveTripOverlay
                                      socket={socket}
                                      activeRide={activeRide} tripStatus={tripStatus} isSimulating={isSimulating}
                                      setIsSimulating={setIsSimulating} setActiveRide={setActiveRide}
                                      setIsVerified={setIsVerified} setOtpInput={setOtpInput}
                                      isVerified={isVerified} otpInput={otpInput} handleVerifyOtp={handleVerifyOtp}
                                      setTripStatus={setTripStatus}
                                  />
                              </motion.div>
                          ) : (
                              <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-3">
                                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                                      <Zap size={18} className="text-gray-200" />
                                  </div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Searching for rides...</p>
                              </div>
                          )}
                      </AnimatePresence>
                  </div>
              </div>
          </motion.div>

          {/* Incoming Request Overlay */}
          <IncomingRideCard incomingRide={incomingRide} requestTimer={requestTimer} handleAcceptRide={handleAcceptRide} setIncomingRide={setIncomingRide} />
      </div>
    </div>
  )
}
