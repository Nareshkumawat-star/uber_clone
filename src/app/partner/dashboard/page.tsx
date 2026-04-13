'use client'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Car, FileText, Landmark, Settings, LogOut, ChevronRight, Bell, User, MapPin as MapPinIcon, Navigation, Map, ShieldCheck, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useSocket } from '@/components/SocketProvider'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const LiveMap = dynamic(() => import('@/components/LiveMap'), { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-white/5 animate-pulse rounded-[2rem]" />
})

const EarningsSection = dynamic(() => import('@/components/EarningsSection'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-white/5 animate-pulse rounded-[2rem]" />
})

export default function PartnerDashboard() {
  const stats = [
    { label: 'Total Earnings', value: '₹0.00', icon: Landmark, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: "Today's Rides", value: '0', icon: Car, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ]

  const { socket, isConnected } = useSocket()
  const [incomingRide, setIncomingRide] = useState<any>(null)
  const [activeRide, setActiveRide] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'earnings'>('dashboard')
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [requestTimer, setRequestTimer] = useState(20)
  const [otpInput, setOtpInput] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [tripStatus, setTripStatus] = useState<'approaching' | 'ongoing' | 'completed'>('approaching')
  const [isSimulating, setIsSimulating] = useState(false)

  useEffect(() => {
    if (!socket) return;
    
    socket.on('new_ride_request', (data) => {
       console.log('Incoming ride request received on client:', data);
       setIncomingRide(data);
    });

    return () => {
       socket.off('new_ride_request');
    };
  }, [socket]);

  // Timer for incoming ride
  useEffect(() => {
    let interval: any;
    if (incomingRide && requestTimer > 0) {
      interval = setInterval(() => {
        setRequestTimer((prev) => prev - 1);
      }, 1000);
    } else if (requestTimer === 0) {
      setIncomingRide(null);
      setRequestTimer(20);
    }
    return () => clearInterval(interval);
  }, [incomingRide, requestTimer]);

  // Get Partner's Live Location
  useEffect(() => {
    if (!navigator.geolocation) return;
    
    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            setCurrentLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
        },
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleAcceptRide = () => {
    if (!socket || !incomingRide) return;
    socket.emit('accept_ride', { ...incomingRide, partner: { name: 'GoRide Partner', rating: '5.0' }});
    setActiveRide(incomingRide);
    setIncomingRide(null);
    setTripStatus('approaching');
    setRequestTimer(20);

    // Immediate location broadcast upon acceptance
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('update_location', { 
            partnerId: 'test-partner', 
            coords: { lat: position.coords.latitude, lng: position.coords.longitude } 
        });
    });
  };

  useEffect(() => {
    if (!socket) return;
    
    // Listen for the broadcast of our own acceptance to get the OTP
    socket.on('ride_accepted', (data) => {
       if (activeRide && !activeRide.otp) {
          setActiveRide((prev: any) => ({ ...prev, otp: data.otp }));
       }
    });

    return () => {
        socket.off('ride_accepted');
    };
  }, [socket, activeRide]);

  const handleVerifyOtp = () => {
    if (otpInput === activeRide?.otp) {
       setIsVerified(true);
       setTripStatus('ongoing');
       // Notify the rider that the trip has started
       if (socket) socket.emit('trip_started', { rideId: activeRide.id });
    } else {
       alert("Invalid Verification Code. Please ask the rider for the correct code.");
    }
  };

  // Live Location Tracking for active rides
  useEffect(() => {
    if (!socket || !activeRide) return;

    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            console.log('Emitting live location:', coords);
            socket.emit('update_location', { 
                partnerId: 'test-partner', // Could be dynamic based on session
                coords 
            });
        },
        (error) => console.error('Geolocation Error:', error),
        { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [socket, activeRide]);

  // Simulation Logic
  useEffect(() => {
    if (!isSimulating || !activeRide || !socket) return;

    let currentLat = activeRide.pickupCoords.lat + 0.01;
    let currentLng = activeRide.pickupCoords.lng + 0.01;

    const interval = setInterval(() => {
        // Slowly move towards the pickup location
        currentLat -= (currentLat - activeRide.pickupCoords.lat) * 0.1;
        currentLng -= (currentLng - activeRide.pickupCoords.lng) * 0.1;

        console.log('SIMULATION: Moving to', { lat: currentLat, lng: currentLng });
        socket.emit('update_location', { 
            partnerId: 'test-partner', 
            coords: { lat: currentLat, lng: currentLng } 
        });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating, activeRide, socket]);

  const handleDeclineRide = () => {
    setIncomingRide(null);
    setRequestTimer(20);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex select-none font-sans selection:bg-purple-500/30">
      {/* Sidebar background gradient blob */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Sidebar */}
      <motion.div 
        animate={{ 
            width: isSidebarOpen 
                ? (typeof window !== 'undefined' && window.innerWidth < 1024 ? '100%' : '256px') 
                : '0px' 
        }}
        className={`fixed lg:relative z-50 h-full border-r border-white/10 flex flex-col items-center py-8 bg-black/40 backdrop-blur-3xl overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0'}`}
      >
        <div className="flex items-center justify-between w-full px-6 mb-12">
            <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
              GoRide<span className="text-purple-500">.</span>
            </h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white">
                <Bell size={20} />
            </button>
        </div>
        
        <div className="flex-1 w-full px-4 space-y-4">
          <NavItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => {setActiveTab('dashboard'); if(window.innerWidth < 1024) setIsSidebarOpen(false)}}
          />
          <NavItem 
            icon={Landmark} 
            label="Earnings" 
            active={activeTab === 'earnings'}
            onClick={() => {setActiveTab('earnings'); if(window.innerWidth < 1024) setIsSidebarOpen(false)}}
          />
        </div>

        <button 
          onClick={() => signOut()}
          className="mt-auto w-full px-4 group"
        >
          <div className="w-full flex items-center gap-4 p-4 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all">
            <LogOut size={20} />
            <span className="font-semibold tracking-wide text-sm">Sign Out</span>
          </div>
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto relative z-10">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-6">
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
                <div className="flex flex-col gap-1">
                    <div className="w-1 h-1 rounded-full bg-current" />
                    <div className="w-1 h-1 rounded-full bg-current" />
                    <div className="w-1 h-1 rounded-full bg-current" />
                </div>
            </button>
            <div>
                <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl md:text-4xl font-black tracking-tight"
                >
                {activeTab === 'dashboard' ? 'Overview' : 'Earnings'}
                </motion.h2>
                <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mt-2 flex items-center gap-2"
                >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Status: Live & Online {isConnected ? '(Connected)' : '(Disconnected)'}
                </motion.p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-white/10 hover:text-white transition-all">
              <Bell size={20} />
            </div>
            <div className="h-12 pl-2 pr-5 bg-white/5 border border-white/10 rounded-full flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all">
              <div className="flex items-center gap-1.5 px-2 bg-amber-400/10 border border-amber-400/20 rounded-full py-1">
                 <span className="text-[10px] font-black text-amber-400 uppercase tracking-tighter">5.0</span>
                 <Bell size={10} className="text-amber-400 fill-amber-400" />
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[1px]">
                  <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 hidden sm:block">My Profile</span>
            </div>
          </div>
        </div>

        {/* Optimized Split Layout */}
        {activeTab === 'dashboard' ? (
        <div className="relative w-full min-h-[500px] h-[calc(100vh-200px)] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
          {/* Main Map View - Now Full Screen within the container */}
          <div className="absolute inset-0 z-0">
                <LiveMap 
                    currentLocation={currentLocation} 
                    rideRequestLocation={incomingRide?.pickupCoords || (!isVerified && activeRide ? activeRide.pickupCoords : null)}
                    destinationLocation={activeRide ? (isVerified ? activeRide.destinationCoords : activeRide.pickupCoords) : null} 
                />
            </div>
            
            {/* Map UI Overlays */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none z-10" />
            
            <div className="absolute top-8 left-8 z-20 flex flex-col gap-4">
                <button 
                    onClick={() => setIncomingRide({
                        pickupAddress: "123 Test Street, Delhi",
                        pickupCoords: { lat: 28.5436, lng: 77.1600 },
                        destinationAddress: "Downtown Mall, New Delhi",
                        destinationCoords: { lat: 28.5548, lng: 77.1710 },
                        vehicle: { name: "GoRide Premium", price: "₹250" },
                        distance: "2.5 km",
                        time: "8 mins"
                    })}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-2xl text-white/40 hover:text-white hover:bg-black/60 transition-all flex items-center justify-center"
                    title="Test Incoming Ride"
                >
                    <Bell size={20} />
                </button>
            </div>

            <div className="absolute bottom-8 left-8 right-8 z-20 flex items-end justify-between">
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-3xl border border-white/10 p-5 px-7 rounded-[2rem] shadow-2xl">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Live Status</p>
                  <p className="text-sm font-black tracking-tight text-white">
                    {incomingRide ? 'New Request Found' : 'Waiting for Rides...'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div 
                    onClick={() => currentLocation && setCurrentLocation({...currentLocation})}
                    className="w-14 h-14 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-center text-white/60 hover:text-white hover:scale-105 cursor-pointer transition-all shadow-2xl"
                >
                    <MapPinIcon size={24} />
                </div>
              </div>
            </div>

            {/* Floating Incoming Ride Notification Card */}
            <AnimatePresence>
                {incomingRide && (
                    <motion.div 
                        initial={{ opacity: 0, x: -100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -100, scale: 0.9 }}
                        className="absolute left-8 top-32 z-30 w-full max-w-[340px] bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        {/* Progress Bar Header */}
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
        </div>
        ) : (
          <EarningsSection />
        )}
      </div>

      {/* Active Trip Context Side Panel / Overlay */}
      {activeRide && (
         <div className="fixed top-0 right-0 w-full md:w-96 h-full bg-white z-[60] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="bg-black p-8 text-white">
               <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-white/10 rounded-full">Active Trip</span>
                  <div className="flex gap-2">
                     <button 
                        onClick={() => setIsSimulating(!isSimulating)} 
                        className={`text-[10px] font-black uppercase px-3 py-1 rounded-full transition-all ${isSimulating ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/40'}`}
                     >
                        {isSimulating ? 'Stop Sim' : 'Simulate Drive'}
                     </button>
                     <button onClick={() => {setActiveRide(null); setIsVerified(false); setOtpInput('')}} className="text-white/40 hover:text-white transition-all"><LogOut size={18} /></button>
                  </div>
               </div>
               <h2 className="text-3xl font-black mb-1">
                  {tripStatus === 'approaching' ? 'Pick up Rider' : tripStatus === 'ongoing' ? 'In Progress' : 'Completed'}
               </h2>
               <p className="text-white/50 text-sm font-medium">Trip to {activeRide.destinationAddress.split(',')[0]}</p>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
               <div className="space-y-8">
                  {/* Address Section */}
                  <div className="space-y-6">
                     <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0 mt-1">
                           <MapPinIcon size={14} className="text-white" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pickup Information</p>
                           <p className="font-bold text-gray-800 leading-tight">{activeRide.pickupAddress}</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-1">
                           <Navigation size={14} className="text-black" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dropoff Destination</p>
                           <p className="font-bold text-gray-800 leading-tight">{activeRide.destinationAddress}</p>
                        </div>
                     </div>
                  </div>

                  <div className="h-px bg-gray-100 w-full" />

                  {/* Verification Section */}
                  {!isVerified ? (
                     <div className="bg-blue-50 rounded-[2rem] p-8 border border-blue-100">
                        <div className="flex items-center gap-3 mb-4">
                           <ShieldCheck className="text-blue-600" size={24} />
                           <h4 className="font-black text-blue-900">Verify Identity</h4>
                        </div>
                        <p className="text-blue-700/70 text-sm font-medium mb-6">
                           Ask the rider for their 4-digit code to start the trip.
                        </p>
                        
                        <div className="flex gap-3 justify-center mb-6">
                           {[...Array(4)].map((_, i) => (
                              <input 
                                 key={i}
                                 id={`otp-${i}`}
                                 type="text"
                                 inputMode="numeric"
                                 maxLength={1}
                                 value={otpInput[i] || ''}
                                 onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    const newOtp = otpInput.split('');
                                    newOtp[i] = val;
                                    setOtpInput(newOtp.join(''));

                                    if (val && i < 3) {
                                       const next = document.getElementById(`otp-${i + 1}`);
                                       if (next) next.focus();
                                    }
                                 }}
                                 onKeyDown={(e) => {
                                    if (e.key === 'Backspace' && !otpInput[i] && i > 0) {
                                       const prev = document.getElementById(`otp-${i - 1}`);
                                       if (prev) prev.focus();
                                    }
                                 }}
                                 className="w-14 h-16 bg-white border-2 border-blue-200 rounded-xl text-center text-3xl font-black focus:border-blue-500 focus:outline-none transition-all text-black shadow-inner"
                              />
                           ))}
                        </div>

                        <button 
                           onClick={handleVerifyOtp}
                           disabled={otpInput.length !== 4}
                           className="w-full bg-blue-600 text-white rounded-xl py-4 font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                        >
                           Start Trip
                        </button>
                     </div>
                  ) : (
                     <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4 animate-bounce">
                           <ShieldCheck size={32} />
                        </div>
                        <h4 className="font-black text-emerald-900 text-xl mb-2">Trip Started!</h4>
                        <p className="text-emerald-700/70 text-sm font-medium mb-8">
                           Rider identity verified. Proceed to destination.
                        </p>

                        <button 
                           onClick={() => {
                              setTripStatus('completed');
                              setActiveRide(null);
                              setIsVerified(false);
                              setOtpInput('');
                           }}
                           className="w-full bg-emerald-600 text-white rounded-xl py-4 font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/30 transition-all active:scale-95"
                        >
                           Complete Ride
                        </button>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  )
}

function NavItem({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 group ${
      active 
        ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' 
        : 'hover:bg-white/5 text-gray-500 hover:text-white border border-transparent'
    }`}>
      <Icon size={20} className={`shrink-0 transition-transform duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'group-hover:scale-110'}`} />
      <span className={`font-semibold tracking-wide text-sm whitespace-nowrap ${active ? 'text-white' : ''}`}>
        {label}
      </span>
    </div>
  )
}
