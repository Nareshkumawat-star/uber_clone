'use client'
import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Navigation, Navigation2, Search, Car, CreditCard, ChevronRight, Loader2, Clock, MapPinIcon } from 'lucide-react'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useSocket } from './SocketProvider'

// Crucial: Leaflet requires window object, so we must load it dynamically
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
  const lastGeocodedCoords = useRef<{lat: number, lng: number} | null>(null);
  const [mockCoords, setMockCoords] = useState<{lat: number, lng: number} | null>(null);
  
  // Destination states
  const [destQuery, setDestQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  
  // Debounce logic for destination autocomplete
  useEffect(() => {
      const delayFn = setTimeout(async () => {
          // If the user already selected something, don't search again unless they delete it
          const isCurrentQuerySelected = selectedDestination && selectedDestination.display_name === destQuery;
          if (destQuery && destQuery.length > 2 && !isCurrentQuerySelected) {
              setIsSearching(true);
              try {
                  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destQuery)}&limit=5`);
                  const data = await res.json();
                  setSuggestions(data);
              } catch (err) {
                  console.error('Error fetching suggestions:', err);
              } finally {
                  setIsSearching(false);
              }
          } else {
              setSuggestions([]);
          }
      }, 500);

      return () => clearTimeout(delayFn);
  }, [destQuery, selectedDestination]);

  // Listen for ride acceptance
  useEffect(() => {
    if (!socket) return;
    
    socket.on('ride_accepted', (data) => {
        console.log('Ride accepted by a partner:', data);
        setAssignedPartner(data.partner);
        setCurrentOtp(data.otp);
        setBookingStatus('accepted');
    });

    socket.on('partner_location_update', (data) => {
        console.log('Driver moved:', data.coords);
        setDriverLocation(data.coords);
    });

    socket.on('trip_started', () => {
        console.log('Trip officially started!');
        setIsTripStarted(true);
    });

    return () => {
        socket.off('ride_accepted');
        socket.off('partner_location_update');
        socket.off('trip_started');
    };
  }, [socket]);

  // React to geolocation hook
  useEffect(() => {
      const fetchCurrentLocationName = async (lat: number, lng: number) => {
          try {
              // Only search if coordinates changed significantly (approx 20 meters)
              if (lastGeocodedCoords.current) {
                  const dist = Math.sqrt(
                      Math.pow(lat - lastGeocodedCoords.current.lat, 2) + 
                      Math.pow(lng - lastGeocodedCoords.current.lng, 2)
                  );
                  // Threshold roughly 0.0002 decimal degrees
                  if (dist < 0.0002 && pickup !== 'Fetching current location...') return;
              }

              setPickup('Locating exact address...');
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
              const data = await res.json();
              if (data && data.display_name) {
                  const parts = data.display_name.split(', ');
                  const shortAddress = parts.length > 2 ? `${parts[0]}, ${parts[1]}, ${parts[parts.length - 3] || ''}` : data.display_name;
                  const finalAddress = shortAddress.replace(/, ,/g, ',').replace(/,\s*$/, '');
                  setPickup(finalAddress);
                  lastGeocodedCoords.current = { lat, lng };
              }
          } catch (err) {
              console.error('Reverse geocode error:', err);
          }
      };

      if (!loading && (mockCoords || coordinates)) {
          const coordsToUse = mockCoords || coordinates;
          if (coordsToUse) fetchCurrentLocationName(coordsToUse.lat, coordsToUse.lng);
      }
  }, [coordinates, mockCoords, loading]);

  const handleRecenter = () => {
      setMockCoords(null);
      if (coordinates) {
          setPickup('Locating...');
          lastGeocodedCoords.current = null; // Force refresh
      }
  };

  const handleMockLocation = () => {
    const testLocation = { lat: 28.6441, lng: 77.1118 }; // Pacific Mall, Delhi
    setMockCoords(testLocation);
    setPickup('Mocked: Pacific Mall, Delhi');
  };

  const handleSelectSuggestion = (place: any) => {
      setDestQuery(place.display_name);
      setSelectedDestination({
          ...place,
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon)
      });
      setSuggestions([]); // Close dropdown
  };

  const vehicles = [
      { id: 'bike', name: 'GoRide Bike', time: '2 min', price: '₹35', img: 'https://cdn-icons-png.flaticon.com/512/2953/2953362.png' },
      { id: 'car', name: 'GoRide Car', time: '4 min', price: '₹85', img: 'https://cdn-icons-png.flaticon.com/512/1048/1048313.png' },
      { id: 'suv', name: 'GoRide SUV', time: '6 min', price: '₹140', img: 'https://cdn-icons-png.flaticon.com/512/5555/5555122.png' },
      { id: 'delivery', name: 'GoRide Delivery', time: '10 min', price: '₹100', img: 'https://cdn-icons-png.flaticon.com/512/2766/2766141.png' },
  ];

  const [activeVehicleId, setActiveVehicleId] = useState(vehicles[0].id);
  const activeVehicle = vehicles.find(v => v.id === activeVehicleId);

  const handleBookRide = () => {
      if (!socket || !isConnected) {
          alert('System is connecting to dispatch. Please wait.');
          return;
      }

      if (!coordinates || !selectedDestination) {
          alert('Please ensure both pickup and destination are selected.');
          return;
      }

      const ridePayload = {
          pickupAddress: pickup,
          pickupCoords: coordinates,
          destinationAddress: destQuery,
          destinationCoords: { lat: selectedDestination.lat, lng: selectedDestination.lng },
          vehicle: activeVehicle,
      };

      socket.emit('request_ride', ridePayload);
      console.log('CLIENT: Emitting request_ride to server:', ridePayload);
      setBookingStatus('searching');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row pt-20">
      
      {/* Left Panel: Booking Interface */}
      {bookingStatus === 'searching' ? (
          <div className="w-full md:w-[450px] lg:w-[500px] bg-white flex flex-col items-center justify-center shadow-2xl z-20 h-[calc(100vh-80px)] p-8 text-center space-y-6">
              <div className="relative w-32 h-32 flex items-center justify-center mx-auto mb-8">
                  <div className="absolute inset-0 bg-black/5 rounded-full animate-ping"></div>
                  <div className="absolute inset-4 bg-black/10 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                  <div className="absolute inset-8 bg-black/20 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
                  <Car className="w-8 h-8 text-black relative z-10" />
              </div>
              <h2 className="text-3xl font-black text-black tracking-tight">Finding your partner...</h2>
              <p className="text-gray-500 font-medium text-sm">We are dispatching your request to nearby {activeVehicle?.name} drivers.</p>
              
              {/* Progress Bar */}
              <div className="w-full max-w-[200px] h-2 bg-gray-100 rounded-full overflow-hidden mt-8 relative">
                  <div className="h-full bg-black w-full rounded-full animate-pulse"></div>
              </div>

              <button 
                  onClick={() => setBookingStatus('idle')}
                  className="mt-8 px-6 py-3 border-2 border-gray-100 hover:border-black text-black font-bold rounded-2xl transition-all active:scale-95"
              >
                  Cancel Request
              </button>
          </div>
      ) : bookingStatus === 'accepted' ? (
          <div className="w-full md:w-[450px] lg:w-[500px] bg-white flex flex-col shadow-2xl z-20 h-[calc(100vh-80px)] p-8">
              <div className="flex-1 flex flex-col justify-center items-center text-center">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                      <Car size={32} className="text-green-500" />
                  </div>
                  <h2 className="text-3xl font-black text-black mb-2 tracking-tight">Driver Confirmed!</h2>
                  <p className="text-gray-500 font-medium text-sm mb-8">
                      {assignedPartner?.name || 'A partner'} is on their way to pick you up in a {activeVehicle?.name}.
                  </p>
                  
                  <div className="w-full bg-gray-50 rounded-[2rem] p-6 border border-gray-100 mb-8 flex items-center gap-4 text-left">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex overflow-hidden shrink-0">
                          {/* Placeholder driver avatar */}
                          <img src="https://ui-avatars.com/api/?name=Partner&background=0D8ABC&color=fff" alt="Driver" />
                      </div>
                      <div className="flex-1">
                          <h3 className="font-bold text-lg text-black">{assignedPartner?.name || 'Partner'}</h3>
                          <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                             ★ {assignedPartner?.rating || '5.0'} Rating
                          </div>
                      </div>
                      <div className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold">
                          {activeVehicle?.price}
                      </div>
                  </div>

                  {currentOtp && (
                    <div className="w-full bg-blue-600 text-white rounded-[2rem] p-8 mb-8 shadow-xl shadow-blue-500/30">
                        <p className="text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-80">Verification Code</p>
                        <h4 className="text-6xl font-black tracking-tighter mb-4">{currentOtp}</h4>
                        <p className="text-sm font-medium opacity-90 leading-relaxed">
                            Share this code with your partner only when they reach your location to start the trip.
                        </p>
                    </div>
                  )}

                  <button 
                      onClick={() => setBookingStatus('idle')}
                      className="w-full py-4 bg-black text-white rounded-2xl font-black text-lg hover:bg-gray-900 transition-all active:scale-95 shadow-xl shadow-black/20"
                  >
                      Cancel Trip
                  </button>
              </div>
          </div>
      ) : (
      <div className="w-full md:w-[450px] lg:w-[500px] bg-white flex flex-col shadow-2xl z-20 h-[calc(100vh-80px)]">
        
        {/* Input Section */}
        <div className="p-6 md:p-8 bg-white border-b border-gray-100 relative z-30">
            <h1 className="text-3xl font-black text-black tracking-tight mb-8">Get a ride</h1>
            
            <div className="relative">
                {/* Timeline connector visual */}
                <div className="absolute left-[20px] top-[24px] bottom-[28px] w-0.5 bg-black/10 z-0" />
                
                {/* Pickup Input */}
                <div className="relative z-10 flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0 shadow-lg">
                        <Navigation2 size={16} className="text-white" />
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 flex items-center px-4 py-3 group hover:border-black/20 hover:bg-gray-100 transition-all focus-within:border-black focus-within:bg-white focus-within:ring-4 focus-within:ring-black/5">
                        <input 
                            type="text" 
                            className="bg-transparent w-full outline-none text-black font-semibold text-sm placeholder:text-gray-400 placeholder:font-medium"
                            placeholder="Add a pickup location"
                            value={pickup}
                            onChange={(e) => setPickup(e.target.value)}
                        />
                        <button 
                            onClick={handleRecenter}
                            title="Use current location"
                            className="p-2 hover:bg-black/5 rounded-full transition-all text-black/40 hover:text-black"
                        >
                            <Navigation size={14} />
                        </button>
                        {loading && <Loader2 size={16} className="animate-spin text-gray-400" />}
                    </div>
                </div>

                {/* Destination Input Container */}
                <div className="relative z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <MapPin size={16} className="text-black" />
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 flex items-center px-4 py-3 group hover:border-black/20 hover:bg-gray-100 transition-all focus-within:border-black focus-within:bg-white focus-within:ring-4 focus-within:ring-black/5">
                            <input 
                                type="text" 
                                className="bg-transparent w-full outline-none text-black font-semibold text-sm placeholder:text-gray-400 placeholder:font-medium"
                                placeholder="Enter destination"
                                value={destQuery}
                                onChange={(e) => {
                                    setDestQuery(e.target.value);
                                    if (selectedDestination) setSelectedDestination(null); // Clear selection on edit
                                }}
                            />
                            {isSearching && <Loader2 size={16} className="animate-spin text-gray-400" />}
                        </div>
                    </div>

                    {/* Suggestions Dropdown */}
                    {suggestions.length > 0 && (
                        <div className="absolute left-[56px] right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                            {suggestions.map((place, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => handleSelectSuggestion(place)}
                                    className="p-4 hover:bg-gray-50 cursor-pointer flex gap-3 border-b border-gray-50 last:border-0"
                                >
                                    <div className="mt-1">
                                        <MapPinIcon size={16} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-black line-clamp-1">{place.display_name.split(',')[0]}</p>
                                        <p className="text-xs text-gray-500 line-clamp-1">{place.display_name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Dynamic Content: Show Vehicles ONLY if Destination is Selected */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#f8f9fa] relative z-10">
            {selectedDestination ? (
                <>
                    {/* Scrollable Vehicle Options */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-2">Available Rides</p>
                        
                        {vehicles.map((v) => {
                            const isSelected = activeVehicleId === v.id;
                            return (
                                <div 
                                    key={v.id} 
                                    onClick={() => setActiveVehicleId(v.id)}
                                    className={`p-4 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between group ${isSelected ? 'bg-white border-black shadow-xl ring-1 ring-black' : 'bg-white border-transparent shadow-sm hover:border-black/10'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center p-2 shrink-0">
                                            <img src={v.img} alt={v.name} className={`w-full object-contain mix-blend-multiply transition-transform ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-black text-lg">{v.name}</h3>
                                            <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                                <Clock size={12} /> {v.time} away
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-xl text-black">{v.price}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Booking Footer */}
                    <div className="p-6 bg-white border-t border-gray-100 flex-shrink-0">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-6 bg-black rounded flex items-center justify-center">
                                    <CreditCard size={14} className="text-white" />
                                </div>
                                <span className="font-semibold text-sm">Cash / UPI</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </div>
                        <button 
                            onClick={handleBookRide}
                            className="w-full py-4 bg-black text-white rounded-2xl font-black text-lg hover:bg-gray-900 transition-all active:scale-95 shadow-xl shadow-black/20 flex items-center justify-center gap-2"
                        >
                            Book {activeVehicle?.name}
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#f8f9fa]">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <h2 className="text-xl font-bold text-black mb-2">Where to?</h2>
                    <p className="text-gray-400 text-sm max-w-[200px]">Search for a destination to see available rides and estimates.</p>
                </div>
            )}
        </div>
      </div>
      )}

      {/* Right Panel: Live Interactive Map */}
      <div className="flex-1 bg-gray-100 relative h-[50vh] md:h-auto z-10 border-l border-gray-200">
          <div className="absolute inset-0 z-0">
             <LiveMap 
                currentLocation={isTripStarted && driverLocation ? driverLocation : (mockCoords || coordinates)} 
                destinationLocation={bookingStatus === 'accepted' && !isTripStarted ? null : selectedDestination} 
                driverLocation={bookingStatus === 'accepted' ? driverLocation : null}
             />
          </div>

          {/* Map Overlay Buttons (Mocking) */}
          <div className="absolute bottom-10 right-10 z-20 flex flex-col gap-3">
              <button 
                onClick={handleMockLocation}
                className="bg-white text-black px-6 py-3 rounded-2xl font-black text-xs shadow-2xl border border-gray-100 uppercase tracking-widest hover:scale-105 transition-all active:scale-95"
              >
                📍 Mock Rider (Test Path)
              </button>
          </div>
      </div>

    </div>
  )
}
