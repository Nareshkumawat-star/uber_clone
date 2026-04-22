'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { 
    MapPin, Navigation, Search, ChevronLeft, LocateFixed, 
    Bike, Car, Truck, Phone, ShieldCheck, Clock, 
    ArrowRight, Info, CheckCircle2, ChevronRight
} from 'lucide-react'

// Custom Auto Rickshaw Icon
const AutoIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1-3-4-3-4 3-4 3H3c-1.1 0-2 .9-2 2v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
        <path d="M7 10v4" />
        <path d="M11 7v3" />
    </svg>
)

export default function BookingPage() {
    const router = useRouter()
    const [pickup, setPickup] = useState('')
    const [dropoff, setDropoff] = useState('')
    const [selectedVehicle, setSelectedVehicle] = useState<'bike' | 'auto' | 'car' | 'truck'>('bike')
    const [mobileNumber, setMobileNumber] = useState('')
    const [pickupCoords, setPickupCoords] = useState<{lat: number, lon: number} | null>(null)
    const [dropoffCoords, setDropoffCoords] = useState<{lat: number, lon: number} | null>(null)
    const [isLocating, setIsLocating] = useState(false)
    const [distance, setDistance] = useState<number | null>(null)

    // Haversine formula to calculate distance in KM
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371 
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    useEffect(() => {
        if (pickupCoords && dropoffCoords) {
            const dist = calculateDistance(pickupCoords.lat, pickupCoords.lon, dropoffCoords.lat, dropoffCoords.lon)
            setDistance(dist)
        }
    }, [pickupCoords, dropoffCoords])

    const getFare = (baseRate: number) => {
        if (!distance) return baseRate.toString()
        const calculated = Math.round(30 + (distance * baseRate))
        return calculated.toString()
    }
    
    // Suggestion states
    const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([])
    const [pickupSuggestionData, setPickupSuggestionData] = useState<any[]>([])
    const [showPickupSuggestions, setShowPickupSuggestions] = useState(false)
    const [isPickupSearching, setIsPickupSearching] = useState(false)
    
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [suggestionData, setSuggestionData] = useState<any[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isDropoffSearching, setIsDropoffSearching] = useState(false)

    const handlePickupChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setPickup(val)
        if (val.length > 2) {
            setIsPickupSearching(true)
            try {
                const response = await fetch(`/api/location/proxy?type=search&q=${encodeURIComponent(val)}`)
                const data = await response.json()
                if (data && Array.isArray(data)) {
                    setPickupSuggestions(data.map((item: any) => item.display_name))
                    setPickupSuggestionData(data)
                    setShowPickupSuggestions(true)
                }
            } catch (error) {
                console.error("Pickup search error:", error)
            } finally {
                setIsPickupSearching(false)
            }
        } else {
            setPickupSuggestions([])
            setShowPickupSuggestions(false)
        }
    }

    const handleDropoffChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setDropoff(val)
        if (val.length > 2) {
            setIsDropoffSearching(true)
            try {
                const response = await fetch(`/api/location/proxy?type=search&q=${encodeURIComponent(val)}`)
                const data = await response.json()
                if (data && Array.isArray(data)) {
                    setSuggestions(data.map((item: any) => item.display_name))
                    setSuggestionData(data)
                    setShowSuggestions(true)
                }
            } catch (error) {
                console.error("Dropoff search error:", error)
            } finally {
                setIsDropoffSearching(false)
            }
        } else {
            setSuggestions([])
            setShowSuggestions(false)
        }
    }

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser")
            return
        }
        setIsLocating(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                setPickupCoords({ lat: latitude, lon: longitude })
                try {
                    const response = await fetch(`/api/location/proxy?type=reverse&lat=${latitude}&lon=${longitude}`)
                    const data = await response.json()
                    if (data && data.display_name) {
                        setPickup(data.display_name)
                    } else {
                        setPickup(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
                    }
                } catch (error) {
                    setPickup(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
                } finally {
                    setIsLocating(false)
                }
            },
            () => {
                alert("Unable to retrieve your location")
                setIsLocating(false)
            }
        )
    }

    const handleContinue = async () => {
        if (!pickup || !dropoff || !mobileNumber) {
            alert("Please fill in all details")
            return
        }

        let pLatLong = pickupCoords
        let dLatLong = dropoffCoords

        const geocode = async (text: string) => {
            try {
                const res = await fetch(`/api/location/proxy?type=search&q=${encodeURIComponent(text)}`)
                if (!res.ok) return null
                
                const contentType = res.headers.get("content-type")
                if (!contentType || !contentType.includes("application/json")) return null

                const data = await res.json()
                if (data && data[0]) {
                    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
                }
            } catch (e) {
                console.error("Manual geocode failed", e)
            }
            return null
        }

        if (!pLatLong) pLatLong = await geocode(pickup)
        if (!dLatLong) dLatLong = await geocode(dropoff)

        const query = new URLSearchParams({
            pickup,
            dropoff,
            vehicle: selectedVehicle,
            mobile: mobileNumber,
            ...(pLatLong && { plat: pLatLong.lat.toString(), plon: pLatLong.lon.toString() }),
            ...(dLatLong && { dlat: dLatLong.lat.toString(), dlon: dLatLong.lon.toString() })
        }).toString()

        router.push(`/book/status?${query}`)
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-black pb-40">
            {/* Minimal Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-black/5 sticky top-0 z-50 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 hover:bg-black/5 rounded-full transition-transform active:scale-95">
                        <ChevronLeft size={24} strokeWidth={2.5} />
                    </button>
                    <h1 className="text-lg font-black tracking-tight uppercase">Ready to Ride</h1>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <ShieldCheck size={22} />
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-6 space-y-10">
                {/* 1. LOCATIONS SECTION */}
                <section className="bg-white rounded-[2.5rem] shadow-sm border border-black/5 relative p-2">
                    {/* Pickup */}
                    <div className="p-6 flex items-center gap-5 relative group">
                        <div className="w-3 h-3 rounded-full bg-black ring-4 ring-black/10 z-10" />
                        <div className="absolute left-[31px] top-[40px] bottom-0 w-[2px] bg-black/5 group-hover:bg-black/10 transition-colors" />
                        <div className="flex-1 relative">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">From Pickup</label>
                            <input 
                                type="text" 
                                value={pickup}
                                onChange={handlePickupChange}
                                className="w-full bg-transparent border-none focus:ring-0 outline-none text-[13px] font-black p-0 placeholder:text-gray-200"
                                placeholder="Enter starting point"
                            />
                            {showPickupSuggestions && (
                                <div className="absolute top-full left-0 w-full bg-white shadow-2xl border border-black/5 rounded-2xl mt-2 z-[70] overflow-hidden">
                                    {pickupSuggestions.map((s, i) => (
                                        <button key={i} onClick={() => { setPickup(s); setPickupCoords({lat: parseFloat(pickupSuggestionData[i].lat), lon: parseFloat(pickupSuggestionData[i].lon)}); setShowPickupSuggestions(false); }} className="w-full px-5 py-4 text-left text-[11px] font-bold hover:bg-black/5 border-b border-black/5 last:border-0">{s}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={getCurrentLocation} className={`w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center transition-all ${isLocating ? 'animate-pulse text-emerald-500' : 'text-black/40 hover:text-black hover:bg-black/10'}`}>
                            <LocateFixed size={18} />
                        </button>
                    </div>

                    <div className="h-[1px] bg-black/5 mx-6" />

                    {/* Destination */}
                    <div className="p-6 flex items-center gap-5 relative group">
                        <div className="w-3 h-3 bg-black ring-4 ring-black/10 rotate-45 z-10" />
                        <div className="flex-1 relative">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">To Destination</label>
                            <input 
                                type="text" 
                                value={dropoff}
                                onChange={handleDropoffChange}
                                className="w-full bg-transparent border-none focus:ring-0 outline-none text-[13px] font-black p-0 placeholder:text-gray-200"
                                placeholder="Where are you going?"
                            />
                            {showSuggestions && (
                                <div className="absolute top-full left-0 w-full bg-white shadow-2xl border border-black/5 rounded-2xl mt-2 z-[70] overflow-hidden">
                                    {suggestions.map((s, i) => (
                                        <button key={i} onClick={() => { setDropoff(s); setDropoffCoords({lat: parseFloat(suggestionData[i].lat), lon: parseFloat(suggestionData[i].lon)}); setShowSuggestions(false); }} className="w-full px-5 py-4 text-left text-[11px] font-bold hover:bg-black/5 border-b border-black/5 last:border-0">{s}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 2. CHOOSE RIDE SECTION - Only show when distance is calculated */}
                <AnimatePresence>
                    {distance ? (
                        <motion.section 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                 <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-black">Select Vehicle & Price</h2>
                                 <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                     <Clock size={12} />
                                     <span>Estimated distance: {distance.toFixed(1)} km</span>
                                 </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'bike', icon: <Bike size={24} />, name: 'Moto', base: 12, time: '2 min' },
                                    { id: 'auto', icon: <AutoIcon className="w-6 h-6" />, name: 'Auto', base: 18, time: '4 min' },
                                    { id: 'car', icon: <Car size={24} />, name: 'UberGo', base: 25, time: '6 min' },
                                    { id: 'truck', icon: <Truck size={24} />, name: 'UberXL', base: 40, time: '8 min' }
                                ].map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() => setSelectedVehicle(v.id as any)}
                                        className={`p-6 rounded-[2.5rem] border-2 text-left relative overflow-hidden transition-all duration-300 ${
                                            selectedVehicle === v.id 
                                            ? 'border-black bg-black text-white shadow-2xl scale-[1.02]' 
                                            : 'border-gray-100 bg-white hover:border-black/10'
                                        }`}
                                    >
                                        <div className={`${selectedVehicle === v.id ? 'text-white' : 'text-gray-400'} mb-6`}>
                                            {v.icon}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xs font-black uppercase tracking-widest">{v.name}</h3>
                                            <p className={`text-[9px] font-bold uppercase tracking-tight ${selectedVehicle === v.id ? 'text-white/40' : 'text-gray-300'}`}>
                                                Arrival: {v.time}
                                            </p>
                                        </div>
                                        <div className="mt-6 flex items-baseline gap-1">
                                            <span className="text-[10px] font-black opacity-30 uppercase">₹</span>
                                            <span className="text-2xl font-black italic">{getFare(v.base)}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.section>
                    ) : (
                        <div className="bg-gray-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-200">
                             <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-gray-300 mx-auto mb-6 shadow-sm">
                                 <Navigation size={24} />
                             </div>
                             <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Find your destination</h3>
                             <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-2 px-10">Select a location above to see available rides and pricing</p>
                        </div>
                    )}
                </AnimatePresence>

                {/* 3. MOBILE NUMBER SECTION */}
                <section className="bg-white border border-black/5 rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-black">
                             <Phone size={22} />
                         </div>
                         <div className="flex-1">
                             <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Confirmation Mobile</label>
                             <input 
                                 type="text" 
                                 value={mobileNumber}
                                 onChange={(e) => setMobileNumber(e.target.value)}
                                 placeholder="Enter for trip updates"
                                 className="w-full text-base font-black outline-none placeholder:text-gray-200"
                             />
                         </div>
                    </div>
                </section>
            </main>

            {/* STICKY BOOK BUTTON - Only show when distance is calculated */}
            <AnimatePresence>
                {distance && (
                    <div className="fixed bottom-0 left-0 w-full p-6 md:p-8 bg-gradient-to-t from-white via-white/80 to-transparent z-[60]">
                        <motion.div 
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            className="max-w-2xl mx-auto"
                        >
                            <button 
                                onClick={handleContinue}
                                className="w-full bg-black text-white py-6 rounded-[2.5rem] text-sm font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-gray-900 transition-all flex items-center justify-center gap-4 group"
                            >
                                <span>Book {selectedVehicle} Now</span>
                                <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
