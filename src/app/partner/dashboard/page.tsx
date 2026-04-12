'use client'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Car, FileText, Landmark, Settings, LogOut, ChevronRight, Bell, User, MapPin as MapPinIcon, Navigation, Map, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { useSocket } from '@/components/SocketProvider'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const LiveMap = dynamic(() => import('@/components/LiveMap'), { 
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

  const handleAcceptRide = () => {
    if (!socket || !incomingRide) return;
    socket.emit('accept_ride', { ...incomingRide, partner: { name: 'GoRide Partner', rating: '5.0' }});
    // The server will respond with 'ride_accepted' which we already listen for, 
    // but for the partner, we can set state immediately
    setActiveRide(incomingRide);
    setIncomingRide(null);
    setTripStatus('approaching');

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
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex select-none font-sans selection:bg-purple-500/30">
      {/* Sidebar background gradient blob */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Sidebar */}
      <div className="w-20 md:w-24 lg:w-64 border-r border-white/10 flex flex-col items-center py-8 relative z-10 bg-black/40 backdrop-blur-3xl">
        <h1 className="text-2xl font-black tracking-tighter mb-12 hidden lg:block bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
          GoRide<span className="text-purple-500">.</span>
        </h1>
        <div className="lg:hidden w-10 h-10 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-xl mb-12 shadow-lg shadow-purple-500/20" />
        
        <div className="flex-1 w-full px-4 space-y-4">
          <NavItem icon={LayoutDashboard} label="Dashboard" active />
          <NavItem icon={Car} label="My Rides" />
          <NavItem icon={FileText} label="Documents" />
          <NavItem icon={Settings} label="Settings" />
        </div>

        <button 
          onClick={() => signOut()}
          className="mt-auto w-full px-4 group"
        >
          <div className="w-full flex items-center gap-4 p-4 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all">
            <LogOut size={20} />
            <span className="font-semibold hidden lg:block tracking-wide text-sm">Sign Out</span>
          </div>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto relative z-10">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl md:text-4xl font-black tracking-tight"
            >
              Overview
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          
          {/* Left Column: Stats and Actions */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        className="bg-white/5 border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between"
                    >
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                            <stat.icon size={18} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-black tracking-tight">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Status / Toggle Card */}
            <motion.div className="flex-1 bg-gradient-to-br from-purple-900/40 to-black/40 border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-6">
                        <Navigation className="text-purple-400" size={24} />
                    </div>
                    <h3 className="text-3xl font-black mb-2 tracking-tighter">Ready to drive?</h3>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
                        Online and looking for requests.
                    </p>
                </div>

                <div className="relative z-10 space-y-3">
                    <button className="w-full bg-white text-black py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all">
                        Go Offline
                    </button>
                    <button 
                         onClick={() => setIncomingRide({
                            pickupAddress: "123 Test Street, Delhi",
                            pickupCoords: { lat: 28.5436, lng: 77.1600 },
                            destinationAddress: "Downtown Mall, New Delhi",
                            destinationCoords: { lat: 28.5548, lng: 77.1710 },
                            vehicle: { name: "GoRide Premium", price: "₹250" }
                          })}
                        className="w-full bg-white/5 text-white/40 border border-white/10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                        Test UI Signal <Bell size={14} />
                    </button>
                </div>
            </motion.div>
          </div>

          {/* Right Column: Hero Map View */}
          <div className="lg:col-span-8 bg-white/5 border border-white/5 rounded-[3rem] p-0 relative overflow-hidden h-full shadow-2xl">
             <div className="absolute inset-0 z-0">
                <LiveMap 
                    currentLocation={incomingRide?.pickupCoords || activeRide?.pickupCoords || null} 
                    destinationLocation={activeRide ? activeRide.destinationCoords : (incomingRide?.destinationCoords || null)} 
                />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute bottom-8 left-8 right-8 z-10 flex items-center justify-between">
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/10 p-4 px-6 rounded-2xl">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Navigation Map</p>
                  <p className="text-sm font-bold tracking-tight">Active Coverage Zone</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-12 h-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white/60 hover:text-white cursor-pointer transition-all">
                    <MapPinIcon size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incoming Ride Overlay Modal */}
      {incomingRide && !activeRide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 50 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               className="bg-white rounded-[3rem] max-w-lg w-full shadow-2xl overflow-hidden flex flex-col text-black pb-8"
            >
               {/* Map Header Preview */}
               <div className="w-full h-48 relative overflow-hidden bg-gray-100">
                  <LiveMap 
                    currentLocation={incomingRide.pickupCoords} 
                    destinationLocation={incomingRide.destinationCoords} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" />
               </div>

               <div className="px-8 -mt-10 relative z-10">
                  <div className="w-16 h-16 rounded-3xl bg-blue-600 shadow-xl shadow-blue-500/40 flex items-center justify-center mx-auto mb-4">
                    <Navigation size={28} className="text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-center mb-1 tracking-tighter">Incoming Request!</h2>
                  <p className="text-gray-500 text-sm text-center mb-6 font-semibold uppercase tracking-widest leading-relaxed">
                    {incomingRide.vehicle?.name}
                  </p>
               </div>

               <div className="px-8 space-y-4 mb-8">
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
                     <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-black/20">
                           <MapPinIcon size={14} className="text-white" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pickup Location</p>
                           <p className="font-bold text-sm leading-tight text-gray-800">{incomingRide.pickupAddress}</p>
                        </div>
                     </div>

                     <div className="w-0.5 h-6 bg-gray-200 ml-4" />

                     <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                           <MapPinIcon size={14} className="text-black" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dropoff Point</p>
                           <p className="font-bold text-sm leading-tight text-gray-800">{incomingRide.destinationAddress}</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center justify-between px-2 pt-2">
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Est. Fare</p>
                        <p className="text-3xl font-black text-black tracking-tighter">{incomingRide.vehicle?.price}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Distance</p>
                        <p className="text-lg font-bold text-gray-800">4.2 km</p>
                     </div>
                  </div>
               </div>

               <div className="px-8 flex gap-4">
                  <button onClick={handleDeclineRide} className="flex-1 bg-gray-100 hover:bg-gray-200 text-black font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl transition-all">
                     Decline
                  </button>
                  <button onClick={handleAcceptRide} className="flex-2 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[11px] py-4 px-8 rounded-2xl shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-3 active:scale-95">
                     Accept <ShieldCheck size={18} />
                  </button>
               </div>
            </motion.div>
        </div>
      )}


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
                        
                        <input 
                           type="text" 
                           maxLength={4}
                           placeholder="Enter 4-digit code"
                           value={otpInput}
                           onChange={(e) => setOtpInput(e.target.value)}
                           className="w-full bg-white border-2 border-blue-200 rounded-2xl p-4 text-center text-3xl font-black tracking-[0.5em] focus:border-blue-500 focus:outline-none transition-all mb-4 text-black"
                        />

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

function NavItem({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={`w-full flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 group ${
      active 
        ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' 
        : 'hover:bg-white/5 text-gray-500 hover:text-white border border-transparent'
    }`}>
      <Icon size={20} className={`transition-transform duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'group-hover:scale-110'}`} />
      <span className={`font-semibold hidden lg:block tracking-wide text-sm ${active ? 'text-white' : ''}`}>
        {label}
      </span>
    </div>
  )
}
