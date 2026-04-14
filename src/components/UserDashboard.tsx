'use client'
import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, Bell, Wallet, MapPin as MapPinIcon, ChevronLeft, CheckCircle2, Star, Timer, ShieldCheck, CreditCard, Search, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useSocket } from './SocketProvider'
import BookingForm from './user/BookingForm'
import RideStatusOverlay from './user/RideStatusOverlay'

const LiveMap = dynamic(() => import('@/components/LiveMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
    )
})

export default function UserDashboard() {
  const { coordinates, loading } = useGeolocation();
  const [pickup, setPickup] = useState('Fetching... ');
  const { socket, isConnected } = useSocket();
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'searching' | 'accepted'>('idle');
  const [assignedPartner, setAssignedPartner] = useState<any>(null);
  const [currentOtp, setCurrentOtp] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isTripStarted, setIsTripStarted] = useState(false);
  const [mockCoords, setMockCoords] = useState<{lat: number, lng: number} | null>(null);
  const [destQuery, setDestQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const lastGeocodedCoords = useRef<{lat: number, lng: number} | null>(null);

  const vehicles = [
      { id: 'bike', name: 'Bike', time: '2m', price: '₹35', img: 'https://cdn-icons-png.flaticon.com/512/2953/2953362.png' },
      { id: 'car', name: 'Car', time: '4m', price: '₹85', img: 'https://cdn-icons-png.flaticon.com/512/1048/1048313.png' },
      { id: 'suv', name: 'SUV', time: '6m', price: '₹140', img: 'https://cdn-icons-png.flaticon.com/512/5555/5555122.png' },
      { id: 'delivery', name: 'Pack', time: '10m', price: '₹100', img: 'https://cdn-icons-png.flaticon.com/512/2766/2766141.png' },
  ];

  const [activeVehicleId, setActiveVehicleId] = useState(vehicles[0].id);
  const activeVehicle = vehicles.find(v => v.id === activeVehicleId);

  const triggerCompletion = () => {
    setShowSuccessOverlay(true);
    handleCancelTrip(false); 
    setBookingStatus('idle');
    // Auto-close after 3 seconds for a "redirect" feel
    setTimeout(() => {
        setShowSuccessOverlay(false);
    }, 4000);
  };

  const handleCancelTrip = (resetStatus = true) => {
    if (resetStatus) setBookingStatus('idle');
    setAssignedPartner(null);
    setCurrentOtp(null);
    setDriverLocation(null);
    setIsTripStarted(false);
    setSelectedDestination(null);
    setDestQuery('');
    setPickup('Fetching... '); // Reset pickup to re-geocode current location
    localStorage.removeItem('userRideState');
    localStorage.removeItem('tripCompletedSignal');
  };

  useEffect(() => {
      const savedState = localStorage.getItem('userRideState');
      if (savedState) {
          try {
              const parsed = JSON.parse(savedState);
              if (parsed.bookingStatus !== 'idle') {
                  setBookingStatus(parsed.bookingStatus);
                  setAssignedPartner(parsed.assignedPartner || null);
                  setCurrentOtp(parsed.currentOtp || null);
                  setSelectedDestination(parsed.selectedDestination || null);
                  setDriverLocation(parsed.driverLocation || null);
                  setIsTripStarted(parsed.isTripStarted || false);
              }
          } catch (e) {}
      }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'tripCompletedSignal') triggerCompletion();
    };
    const interval = setInterval(() => {
        if (localStorage.getItem('tripCompletedSignal') && bookingStatus !== 'idle') triggerCompletion();
    }, 1000);
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
    };
  }, [bookingStatus]);

  useEffect(() => {
      if (bookingStatus !== 'idle') {
          localStorage.setItem('userRideState', JSON.stringify({
              bookingStatus, assignedPartner, currentOtp, selectedDestination, driverLocation, isTripStarted
          }));
      } else if (!showSuccessOverlay) {
          localStorage.removeItem('userRideState');
      }
  }, [bookingStatus, assignedPartner, currentOtp, selectedDestination, driverLocation, isTripStarted, showSuccessOverlay]);

  useEffect(() => {
      const delayFn = setTimeout(async () => {
          const isCurrentQuerySelected = selectedDestination && selectedDestination.display_name === destQuery;
          if (destQuery && destQuery.length > 2 && !isCurrentQuerySelected) {
              setIsSearching(true);
              try {
                  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destQuery)}&limit=5`);
                  const data = await res.json();
                  setSuggestions(data);
              } catch (err) {} finally { setIsSearching(false); }
          } else { setSuggestions([]); }
      }, 500);
      return () => clearTimeout(delayFn);
  }, [destQuery, selectedDestination]);

  useEffect(() => {
    if (!socket) return;
    socket.on('ride_accepted', (data) => {
        setAssignedPartner(data.partner);
        setCurrentOtp(data.otp);
        setBookingStatus('accepted');
    });
    socket.on('partner_location_update', (data) => setDriverLocation(data.coords));
    socket.on('trip_started', () => setIsTripStarted(true));
    socket.on('trip_completed', triggerCompletion);
    return () => {
        socket.off('ride_accepted');
        socket.off('partner_location_update');
        socket.off('trip_started');
        socket.off('trip_completed');
    };
  }, [socket]);

  const handleBookRide = () => {
      if (!socket || !isConnected) { alert('Connecting to dispatch...'); return; }
      if (!coordinates || !selectedDestination) { alert('Select destination.'); return; }
      socket.emit('request_ride', { 
          pickupAddress: pickup, 
          pickupCoords: coordinates, 
          destinationCoords: selectedDestination, 
          vehicle: activeVehicle,
          riderName: "Rahul Sharma",
          riderPhone: "+91 99887 76655"
      });
      setBookingStatus('searching');
  };

  const [isMinimized, setIsMinimized] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-[100dvh] bg-white flex flex-col overflow-hidden font-sans text-black">
      
      {/* Mobile-Adaptive Header */}
      <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0 z-50 bg-white">
          <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <Timer className="text-white w-4 h-4" />
              </div>
              <h1 className="text-lg font-black tracking-tighter">GoRide</h1>
          </div>
          <div className="flex items-center gap-3">
              <button className="text-gray-400 hover:text-black transition-colors"><Bell size={18} /></button>
              <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden">
                  <img src="https://ui-avatars.com/api/?name=User&background=000&color=fff" alt="User" />
              </div>
          </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 relative bg-gray-50">
          <div className="absolute inset-0 z-0">
              <LiveMap 
                currentLocation={isTripStarted && driverLocation ? driverLocation : (mockCoords || coordinates)} 
                destinationLocation={selectedDestination} 
                rideRequestLocation={mockCoords || coordinates}
                driverIconUrl={activeVehicle?.img}
                hideDestinationInfo={bookingStatus !== 'idle' && !isTripStarted}
              />
          </div>

          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
              <button onClick={() => setMockCoords(null)} className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-black active:bg-gray-50"><MapPinIcon size={18} /></button>
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
                      <Search size={14} /> {bookingStatus === 'idle' ? 'Book Now' : 'Ride Info'}
                  </motion.button>
              )}
          </AnimatePresence>
          
          {/* Floating Sidebar/Card - Draggable on Mobile */}
          <motion.div 
              className="absolute bottom-0 left-0 right-0 md:relative md:inset-auto md:w-[380px] md:h-full z-40 p-4 md:p-6 flex flex-col pointer-events-none"
              initial={false}
              animate={{ 
                  y: windowWidth < 768 && isMinimized && bookingStatus === 'idle' ? '95%' : '0%' 
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
              <div className="w-full h-auto md:h-full bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden pointer-events-auto max-h-[75vh] md:max-h-none">
                  {/* Pull handle - Click to toggle, Swipe down to hide in real apps */}
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
                      {isMinimized && bookingStatus === 'idle' && (
                          <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mt-2">Tap to book ride</p>
                      )}
                  </div>
                  
                  <div className={`flex-1 overflow-y-auto scrollbar-hide p-4 md:p-6 transition-opacity duration-300 ${isMinimized && bookingStatus === 'idle' ? 'opacity-0' : 'opacity-100'}`}>
                      <AnimatePresence mode="wait">
                          {bookingStatus === 'idle' ? (
                              <motion.div key="booking" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                                 <BookingForm 
                                    pickup={pickup} setPickup={setPickup} destQuery={destQuery} setDestQuery={setDestQuery}
                                    handleRecenter={() => { setMockCoords(null); lastGeocodedCoords.current = null; }}
                                    loading={loading} isSearching={isSearching} suggestions={suggestions}
                                    handleSelectSuggestion={(place) => { setDestQuery(place.display_name); setSelectedDestination({ ...place, lat: parseFloat(place.lat), lng: parseFloat(place.lon) }); setSuggestions([]); }}
                                    selectedDestination={selectedDestination} setSelectedDestination={setSelectedDestination}
                                    vehicles={vehicles} activeVehicleId={activeVehicleId} setActiveVehicleId={setActiveVehicleId}
                                    handleBookRide={handleBookRide}
                                  />
                              </motion.div>
                          ) : (
                              <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                                  <RideStatusOverlay 
                                    bookingStatus={bookingStatus} activeVehicle={activeVehicle} 
                                    assignedPartner={assignedPartner} currentOtp={currentOtp}
                                    isTripStarted={isTripStarted}
                                    setBookingStatus={setBookingStatus} setIsTripStarted={setIsTripStarted}
                                    onTripComplete={triggerCompletion}
                                    onCancel={handleCancelTrip}
                                  />
                              </motion.div>
                          )}
                      </AnimatePresence>
                  </div>

                  {bookingStatus === 'idle' && (
                      <div className="p-4 border-t border-gray-50">
                        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between hover:bg-black group transition-all cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Wallet className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                <p className="text-sm font-bold group-hover:text-white">₹0.00</p>
                            </div>
                            <ChevronLeft className="rotate-180 w-4 h-4 text-gray-300 group-hover:text-white" />
                        </div>
                      </div>
                  )}
              </div>
          </motion.div>

          {/* Success Overlay Modal */}
          <AnimatePresence>
              {showSuccessOverlay && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 max-w-xs w-full shadow-2xl text-center border border-gray-100">
                          <CheckCircle2 size={48} className="text-black mx-auto mb-4" />
                          <h2 className="text-xl font-black mb-2">Trip Complete</h2>
                          <div className="flex justify-between py-4 border-y border-gray-50 my-6">
                              <div><p className="text-[10px] uppercase font-black text-gray-400">Total</p><p className="font-black text-lg">{activeVehicle?.price}</p></div>
                              <div><p className="text-[10px] uppercase font-black text-gray-400">Time</p><p className="font-black text-lg">12m</p></div>
                          </div>
                          <button onClick={() => setShowSuccessOverlay(false)} className="w-full py-3 bg-black text-white rounded-xl font-black text-sm uppercase tracking-widest">Done</button>
                      </motion.div>
                  </motion.div>
              )}
          </AnimatePresence>
      </div>
    </div>
  )
}
