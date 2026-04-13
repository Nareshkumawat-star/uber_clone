'use client'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Car, Landmark, LogOut, Bell, User, MapPin as MapPinIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { useSocket } from '@/components/SocketProvider'
import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import DashboardStats from '@/components/partner/DashboardStats'
import IncomingRideCard from '@/components/partner/IncomingRideCard'
import ActiveTripOverlay from '@/components/partner/ActiveTripOverlay'

const LiveMap = dynamic(() => import('@/components/LiveMap'), { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-white/5 animate-pulse rounded-[2rem]" />
})

const EarningsSection = dynamic(() => import('@/components/EarningsSection'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-white/5 animate-pulse rounded-[2rem]" />
})

export default function PartnerDashboard() {
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

  const stats = [
    { label: 'Total Earnings', value: '₹0.00', icon: Landmark, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: "Today's Rides", value: '0', icon: Car, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ]

  // Listen for new ride requests
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

  // Persistence logic
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
        } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (activeRide) {
        localStorage.setItem('partnerRideState', JSON.stringify({ activeRide, tripStatus, isVerified, otpInput }));
    } else {
        localStorage.removeItem('partnerRideState');
    }
  }, [activeRide, tripStatus, isVerified, otpInput]);

  // Timer for incoming ride
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

  // Geolocation
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
            phone: '+91 91122 33445'
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
       if (socket) socket.emit('trip_started', { rideId: activeRide.id });
    } else { alert("Invalid Verification Code."); }
  };

  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRide && mainContentRef.current) {
        // Give the UI a moment to render before scrolling
        setTimeout(() => {
            mainContentRef.current?.scrollTo({ top: 300, behavior: 'smooth' });
        }, 300);
    }
  }, [!!activeRide]);

  // Simulation Logic
  useEffect(() => {
    if (!isSimulating || !activeRide || !socket) return;
    const targetCoords = isVerified ? activeRide.destinationCoords : activeRide.pickupCoords;
    let currentLat = isVerified ? activeRide.pickupCoords.lat : activeRide.pickupCoords.lat + 0.01;
    let currentLng = isVerified ? activeRide.pickupCoords.lng : activeRide.pickupCoords.lng + 0.01;
    const interval = setInterval(() => {
        currentLat -= (currentLat - targetCoords.lat) * 0.1;
        currentLng -= (currentLng - targetCoords.lng) * 0.1;
        socket.emit('update_location', { partnerId: 'test-partner', coords: { lat: currentLat, lng: currentLng } });
    }, 2000);
    return () => clearInterval(interval);
  }, [isSimulating, activeRide, socket, isVerified]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex select-none font-sans">
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10" />

      {/* Sidebar */}
      <motion.div 
        animate={{ width: isSidebarOpen ? '256px' : '0px' }}
        className="fixed lg:relative z-50 h-full border-r border-white/10 flex flex-col items-center py-8 bg-black/40 backdrop-blur-3xl overflow-hidden transition-all"
      >
        <div className="flex items-center justify-between w-full px-6 mb-12">
            <h1 className="text-2xl font-black tracking-tighter">GoRide<span className="text-purple-500">.</span></h1>
        </div>
        <div className="flex-1 w-full px-4 space-y-4">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={Landmark} label="Earnings" active={activeTab === 'earnings'} onClick={() => setActiveTab('earnings')} />
        </div>
        <button onClick={() => signOut()} className="mt-auto w-full px-4 text-red-400/70 hover:text-red-400 p-4 flex items-center gap-4 transition-all">
          <LogOut size={20} /> <span className="font-semibold text-sm">Sign Out</span>
        </button>
      </motion.div>

      {/* Main Content */}
      <div ref={mainContentRef} className="flex-1 p-6 lg:p-12 overflow-y-auto relative z-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-black tracking-tight">{activeTab === 'dashboard' ? 'Overview' : 'Earnings'}</h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Status: {isConnected ? 'Online' : 'Offline'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-12 pl-2 pr-5 bg-white/5 border border-white/10 rounded-full flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 bg-amber-400/10 border border-amber-400/20 rounded-full py-1">
                 <span className="text-[10px] font-black text-amber-400 uppercase">5.0</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center p-[1px]">
                  <div className="w-full h-full bg-black rounded-full flex items-center justify-center"><User size={14} /></div>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
        <div className="space-y-6">
            {!activeRide && <DashboardStats stats={stats} />}
            
            <div className={`relative w-full ${activeRide ? 'h-[400px]' : 'h-[600px]'} rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl transition-all duration-700`}>
                <div className="absolute inset-0 z-0">
                    <LiveMap 
                        currentLocation={currentLocation} 
                        rideRequestLocation={incomingRide?.pickupCoords || (!isVerified && activeRide ? activeRide.pickupCoords : null)}
                        destinationLocation={activeRide ? (isVerified ? activeRide.destinationCoords : activeRide.pickupCoords) : null} 
                        isPartnerWaitingForOTP={!isVerified && !!activeRide}
                    />
                </div>
                
                <div className="absolute bottom-8 left-8 right-8 z-20 flex justify-between items-end">
                    <div className="bg-black/40 backdrop-blur-3xl border border-white/10 p-5 px-7 rounded-[2rem] flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center animate-pulse"><div className="w-3.5 h-3.5 bg-emerald-500 rounded-full" /></div>
                        <div><p className="text-sm font-black text-white">{incomingRide ? 'New Request Found' : activeRide ? 'Heading to Pickup' : 'Waiting for Rides...'}</p></div>
                    </div>
                    <div onClick={() => currentLocation && setCurrentLocation({...currentLocation})} className="w-14 h-14 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-center cursor-pointer transition-all"><MapPinIcon size={24} /></div>
                </div>

                <IncomingRideCard incomingRide={incomingRide} requestTimer={requestTimer} handleAcceptRide={handleAcceptRide} setIncomingRide={setIncomingRide} />
            </div>

            <ActiveTripOverlay 
              activeRide={activeRide} tripStatus={tripStatus} isSimulating={isSimulating} 
              setIsSimulating={setIsSimulating} setActiveRide={setActiveRide} 
              setIsVerified={setIsVerified} setOtpInput={setOtpInput}
              isVerified={isVerified} otpInput={otpInput} handleVerifyOtp={handleVerifyOtp}
              setTripStatus={setTripStatus}
            />
        </div>
        ) : (
          <EarningsSection />
        )}
      </div>
    </div>
  )
}

function NavItem({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border border-transparent ${active ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'hover:bg-white/5 text-gray-500 hover:text-white'}`}>
      <Icon size={20} /> <span className={`font-semibold text-sm ${active ? 'text-white' : ''}`}>{label}</span>
    </div>
  )
}
