'use client'
import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, Menu, X, Bell, User as UserIcon, Wallet, MapPin as MapPinIcon, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useSocket } from './SocketProvider'
import BookingForm from './user/BookingForm'
import RideStatusOverlay from './user/RideStatusOverlay'

const LiveMap = dynamic(() => import('@/components/LiveMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-3xl border border-gray-100">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
    )
})

export default function UserDashboard() {
  const { coordinates, loading, error } = useGeolocation();
  const [pickup, setPickup] = useState('Fetching current location...');
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const lastGeocodedCoords = useRef<{lat: number, lng: number} | null>(null);

  const vehicles = [
      { id: 'bike', name: 'GoRide Bike', time: '2 min', price: '₹35', img: 'https://cdn-icons-png.flaticon.com/512/2953/2953362.png' },
      { id: 'car', name: 'GoRide Car', time: '4 min', price: '₹85', img: 'https://cdn-icons-png.flaticon.com/512/1048/1048313.png' },
      { id: 'suv', name: 'GoRide SUV', time: '6 min', price: '₹140', img: 'https://cdn-icons-png.flaticon.com/512/5555/5555122.png' },
      { id: 'delivery', name: 'GoRide Delivery', time: '10 min', price: '₹100', img: 'https://cdn-icons-png.flaticon.com/512/2766/2766141.png' },
  ];

  const [activeVehicleId, setActiveVehicleId] = useState(vehicles[0].id);
  const activeVehicle = vehicles.find(v => v.id === activeVehicleId);

  // Persistence logic...
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
      if (bookingStatus !== 'idle') {
          localStorage.setItem('userRideState', JSON.stringify({
              bookingStatus, assignedPartner, currentOtp, selectedDestination, driverLocation, isTripStarted
          }));
      } else {
          localStorage.removeItem('userRideState');
      }
  }, [bookingStatus, assignedPartner, currentOtp, selectedDestination, driverLocation, isTripStarted]);

  // Autocomplete logic...
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

  // Geocoding logic...
  useEffect(() => {
      const fetchCurrentLocationName = async (lat: number, lng: number) => {
          try {
              if (lastGeocodedCoords.current) {
                  const dist = Math.sqrt(Math.pow(lat - lastGeocodedCoords.current.lat, 2) + Math.pow(lng - lastGeocodedCoords.current.lng, 2));
                  if (dist < 0.0002 && pickup !== 'Fetching current location...') return;
              }
              setPickup('Locating...');
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
              const data = await res.json();
              if (data && data.display_name) {
                  const parts = data.display_name.split(', ');
                  setPickup(parts.length > 2 ? `${parts[0]}, ${parts[1]}` : data.display_name);
                  lastGeocodedCoords.current = { lat, lng };
              }
          } catch (err) {}
      };
      if (!loading && (mockCoords || coordinates)) {
          const coords = mockCoords || coordinates;
          if (coords) fetchCurrentLocationName(coords.lat, coords.lng);
      }
  }, [coordinates, mockCoords, loading]);

  // Socket listeners...
  useEffect(() => {
    if (!socket) return;
    socket.on('ride_accepted', (data) => {
        setAssignedPartner(data.partner);
        setCurrentOtp(data.otp);
        setBookingStatus('accepted');
    });
    socket.on('partner_location_update', (data) => setDriverLocation(data.coords));
    socket.on('trip_started', () => setIsTripStarted(true));
    return () => {
        socket.off('ride_accepted');
        socket.off('partner_location_update');
        socket.off('trip_started');
    };
  }, [socket]);

  const handleBookRide = () => {
      if (!socket || !isConnected) { alert('Connecting to dispatch...'); return; }
      if (!coordinates || !selectedDestination) { alert('Select pickup and destination.'); return; }
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

  return (
    <div className="h-screen bg-white flex overflow-hidden select-none">
      {/* Sidebar - Chat / Info Left side */}
      <div className="hidden md:block w-[500px] h-full bg-white z-40 relative border-r border-gray-100 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col">
              {bookingStatus === 'idle' ? (
                  <BookingForm 
                    pickup={pickup} setPickup={setPickup} destQuery={destQuery} setDestQuery={setDestQuery}
                    handleRecenter={() => { setMockCoords(null); lastGeocodedCoords.current = null; }}
                    loading={loading} isSearching={isSearching} suggestions={suggestions}
                    handleSelectSuggestion={(place) => { setDestQuery(place.display_name); setSelectedDestination({ ...place, lat: parseFloat(place.lat), lng: parseFloat(place.lon) }); setSuggestions([]); }}
                    selectedDestination={selectedDestination} setSelectedDestination={setSelectedDestination}
                    vehicles={vehicles} activeVehicleId={activeVehicleId} setActiveVehicleId={setActiveVehicleId}
                    handleBookRide={handleBookRide}
                  />
              ) : (
                  <RideStatusOverlay 
                    bookingStatus={bookingStatus} activeVehicle={activeVehicle} 
                    assignedPartner={assignedPartner} currentOtp={currentOtp}
                    setBookingStatus={setBookingStatus} setIsTripStarted={setIsTripStarted}
                  />
              )}
          </div>
      </div>

      {/* Content - Map Right side */}
      <div className="flex-1 relative z-10 bg-gray-50">
          <div className="absolute inset-0">
             <LiveMap 
                currentLocation={isTripStarted && driverLocation ? driverLocation : (mockCoords || coordinates)} 
                destinationLocation={selectedDestination} 
                rideRequestLocation={mockCoords || coordinates}
                driverIconUrl={activeVehicle?.img}
             />
          </div>
          
          <div className="absolute bottom-10 right-10 z-20">
              <button 
                onClick={() => setMockCoords({ lat: 28.6441, lng: 77.1118 })} 
                className="bg-white/80 backdrop-blur-md text-black px-6 py-3 rounded-2xl font-black text-xs shadow-2xl border border-white/20 uppercase tracking-widest hover:scale-105 hover:bg-white transition-all active:scale-95"
              >
                📍 Mock Rider
              </button>
          </div>
      </div>
    </div>
  )
}
