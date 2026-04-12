'use client'
import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Navigation, Navigation2, Search, Car, CreditCard, ChevronRight, Loader2, Clock } from 'lucide-react'
import { useGeolocation } from '@/hooks/useGeolocation'

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
  const [destination, setDestination] = useState('');
  
  // React to geolocation hook
  React.useEffect(() => {
      if (!loading && coordinates) {
          // Ideally here we would reverse geocode to get full address string
          // For now, we mock the transition to show successful fetch
          setPickup(`Lat: ${coordinates.lat.toFixed(4)}, Lng: ${coordinates.lng.toFixed(4)}`);
      } else if (error) {
          setPickup('Could not fetch location');
      }
  }, [coordinates, loading, error]);

  const vehicles = [
      { id: 1, name: 'GoRide Auto', time: '3 min', price: '₹45', img: 'https://cdn-icons-png.flaticon.com/512/3204/3204121.png', active: true },
      { id: 2, name: 'GoRide Mini', time: '5 min', price: '₹85', img: 'https://cdn-icons-png.flaticon.com/512/1048/1048313.png', active: false },
      { id: 3, name: 'GoRide Sedan', time: '8 min', price: '₹120', img: 'https://cdn-icons-png.flaticon.com/512/5555/5555122.png', active: false },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row pt-20">
      
      {/* Left Panel: Booking Interface */}
      <div className="w-full md:w-[450px] lg:w-[500px] bg-white flex flex-col shadow-2xl z-20 h-[calc(100vh-80px)]">
        
        {/* Input Section */}
        <div className="p-6 md:p-8 bg-white border-b border-gray-100">
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
                        {loading && <Loader2 size={16} className="animate-spin text-gray-400" />}
                    </div>
                </div>

                {/* Destination Input */}
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <MapPin size={16} className="text-black" />
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 flex items-center px-4 py-3 group hover:border-black/20 hover:bg-gray-100 transition-all focus-within:border-black focus-within:bg-white focus-within:ring-4 focus-within:ring-black/5">
                        <input 
                            type="text" 
                            className="bg-transparent w-full outline-none text-black font-semibold text-sm placeholder:text-gray-400 placeholder:font-medium"
                            placeholder="Enter destination"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            
            <button className="flex items-center gap-3 mt-6 text-black font-bold text-sm bg-gray-50 px-5 py-3 rounded-xl hover:bg-gray-100 transition-colors w-max">
                <Clock size={16} /> Leave now
            </button>
        </div>

        {/* Scrollable Vehicle Options */}
        <div className="flex-1 overflow-y-auto bg-[#f8f9fa] p-6 space-y-4">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-2">Available Rides</p>
            
            {vehicles.map((v) => (
                <div key={v.id} className={`p-4 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between group ${v.active ? 'bg-white border-black shadow-xl' : 'bg-white border-transparent shadow-sm hover:border-black/10'}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center p-2 shrink-0">
                            <img src={v.img} alt={v.name} className="w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
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
            ))}
        </div>

        {/* Booking Footer */}
        <div className="p-6 bg-white border-t border-gray-100">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-6 bg-black rounded flex items-center justify-center">
                        <CreditCard size={14} className="text-white" />
                    </div>
                    <span className="font-semibold text-sm">Cash / UPI</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
            </div>
            <button className="w-full py-4 bg-black text-white rounded-2xl font-black text-lg hover:bg-gray-900 transition-all active:scale-95 shadow-xl shadow-black/20 flex items-center justify-center gap-2">
                Book GoRide Auto
            </button>
        </div>
      </div>

      {/* Right Panel: Live Interactive Map */}
      <div className="flex-1 bg-gray-100 relative h-[50vh] md:h-auto">
        <LiveMap currentLocation={coordinates} />
      </div>

    </div>
  )
}
