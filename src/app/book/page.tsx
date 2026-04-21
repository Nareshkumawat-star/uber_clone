'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bike, Car, Truck, Phone, MapPin, Navigation, CheckCircle2, ChevronLeft, Info, Search, LocateFixed } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

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

const vehicles = [
    { id: 'bike', name: 'Bike', desc: 'Quick & affordable', icon: Bike },
    { id: 'auto', name: 'Auto', desc: 'Everyday rides', icon: AutoIcon },
    { id: 'car', name: 'Car', desc: 'Comfort rides', icon: Car },
    { id: 'loading', name: 'Loading', desc: 'Small cargo', icon: Truck },
    { id: 'truck', name: 'Truck', desc: 'Heavy transport', icon: Truck },
]

export default function BookingPage() {
    const router = useRouter()
    const { userdata } = useSelector((state: RootState) => state.user)
    const [selectedVehicle, setSelectedVehicle] = useState('bike')
    const [mobileNumber, setMobileNumber] = useState(userdata?.mobileNumber || '')
    const [pickup, setPickup] = useState('')
    const [dropoff, setDropoff] = useState('')
    const [isLocating, setIsLocating] = useState(false)
    const [isPickupSearching, setIsPickupSearching] = useState(false)
    const [isDropoffSearching, setIsDropoffSearching] = useState(false)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [showPickupSuggestions, setShowPickupSuggestions] = useState(false)
    const pickupTimeout = React.useRef<NodeJS.Timeout | null>(null)
    const dropoffTimeout = React.useRef<NodeJS.Timeout | null>(null)

    const popularLocations = [
        "JDA Complex, Jhansi",
        "Railway Station, Jhansi",
        "City Bazaar, Jhansi",
        "Medical College, Jhansi",
        "Sipri Bazar, Jhansi",
        "Elite Crossing, Jhansi"
    ]

    const handleLocationClick = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser")
            return
        }
        setIsLocating(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                try {
                    const response = await fetch(`/api/location/proxy?type=reverse&lat=${latitude}&lon=${longitude}`)
                    const data = await response.json()
                    
                    if (data && data.error) {
                        throw new Error(data.error)
                    }

                    if (data && data.display_name) {
                        // Extract a shorter, cleaner version if it's too long
                        const parts = data.display_name.split(',')
                        const cleanAddress = parts.length > 3 ? parts.slice(0, 4).join(',') : data.display_name
                        setPickup(cleanAddress)
                    } else if (data && data.address) {
                        const { road, suburb, city, state } = data.address
                        const manualAddress = [road, suburb, city, state].filter(Boolean).join(', ')
                        setPickup(manualAddress || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
                    } else {
                        setPickup(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
                    }
                } catch (error) {
                    console.error("Reverse geocoding failed:", error)
                    alert("Location found but couldn't get address. Showing coordinates.")
                    setPickup(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
                } finally {
                    setIsLocating(false)
                }
            },
            (error) => {
                console.error("Error getting location:", error)
                alert("Unable to retrieve your location")
                setIsLocating(false)
            },
            { enableHighAccuracy: true }
        )
    }

    const handlePickupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setPickup(val)
        
        if (pickupTimeout.current) clearTimeout(pickupTimeout.current)

        if (val.length > 2) {
            pickupTimeout.current = setTimeout(async () => {
                setIsPickupSearching(true)
                try {
                    const response = await fetch(`/api/location/proxy?type=search&q=${encodeURIComponent(val)}`)
                    const data = await response.json()
                    if (data && Array.isArray(data)) {
                        setPickupSuggestions(data.map((item: any) => item.display_name))
                        setShowPickupSuggestions(true)
                    }
                } catch (error) {
                    console.error("Pickup suggestions fetch failed:", error)
                } finally {
                    setIsPickupSearching(false)
                }
            }, 600)
        } else {
            setShowPickupSuggestions(false)
        }
    }

    const handleDropoffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setDropoff(val)

        if (dropoffTimeout.current) clearTimeout(dropoffTimeout.current)

        if (val.length > 2) {
            dropoffTimeout.current = setTimeout(async () => {
                setIsDropoffSearching(true)
                try {
                    const response = await fetch(`/api/location/proxy?type=search&q=${encodeURIComponent(val)}`)
                    const data = await response.json()
                    if (data && Array.isArray(data)) {
                        setSuggestions(data.map((item: any) => item.display_name))
                        setShowSuggestions(true)
                    }
                } catch (error) {
                    console.error("Suggestions fetch failed:", error)
                } finally {
                    setIsDropoffSearching(false)
                }
            }, 600)
        } else {
            setShowSuggestions(false)
        }
    }

    // Update mobile number if userdata loads after initialization
    useEffect(() => {
        if (userdata?.mobileNumber) {
            setMobileNumber(userdata.mobileNumber)
        }
    }, [userdata])

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans text-black pb-32">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2.5 hover:bg-black/5 rounded-full transition-all active:scale-95 text-gray-400 hover:text-black">
                        <ChevronLeft size={22} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h1 className="text-lg font-black tracking-tight uppercase">Booking Details</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Side</p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                    <Info size={18} className="text-gray-400" />
                </div>
            </div>

            <main className="max-w-2xl mx-auto p-6 md:p-10 space-y-12">
                
                {/* Step 1: Choose Vehicle */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-black">1</div>
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-black">Choose Vehicle</h2>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {vehicles.map((vehicle, index) => (
                            <motion.button
                                key={vehicle.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedVehicle(vehicle.id)}
                                className={`relative p-5 rounded-[2rem] border-2 transition-all duration-500 text-left flex items-center gap-4 group ${
                                    selectedVehicle === vehicle.id 
                                    ? 'bg-black border-black text-white shadow-2xl shadow-black/20' 
                                    : 'bg-white border-black/5 text-black hover:border-black/10 shadow-sm'
                                }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
                                    selectedVehicle === vehicle.id ? 'bg-white/15' : 'bg-black/5 group-hover:bg-black/10'
                                }`}>
                                    <vehicle.icon size={24} strokeWidth={selectedVehicle === vehicle.id ? 2.5 : 2} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-base uppercase tracking-tight leading-tight">{vehicle.name}</h3>
                                    <p className={`text-[11px] font-medium transition-colors duration-500 ${selectedVehicle === vehicle.id ? 'text-white/50' : 'text-gray-400'}`}>
                                        {vehicle.desc}
                                    </p>
                                </div>
                                {selectedVehicle === vehicle.id && (
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="bg-white text-black rounded-full p-1"
                                    >
                                        <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </section>

                {/* Step 2: Mobile */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-black">2</div>
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-black">Mobile</h2>
                    </div>

                    <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-black/5 hover:border-black/10 transition-all flex items-center gap-5 group">
                        <div className="w-14 h-14 bg-black/5 group-hover:bg-black/10 rounded-2xl flex items-center justify-center text-black/50 transition-colors">
                            <Phone size={24} />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mobile Number</label>
                            <input 
                                type="text" 
                                value={mobileNumber}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                                    setMobileNumber(val)
                                }}
                                placeholder="Enter 10 digit number"
                                className="w-full bg-transparent border-none focus:ring-0 outline-none text-xl font-black p-0 tracking-tight placeholder:text-gray-200"
                            />
                        </div>
                        <AnimatePresence>
                            {mobileNumber.length === 10 && (
                                <motion.div 
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <CheckCircle2 size={28} className="text-emerald-500" fill="currentColor" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 flex items-center gap-2 px-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${mobileNumber.length === 10 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        Ride updates will be sent to this number
                    </p>
                </section>

                {/* Step 3: Route */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-black">3</div>
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-black">Route</h2>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-black/5 relative">
                        {/* Pickup */}
                        <div className="p-6 flex items-center gap-5 relative group">
                            <div className="w-3 h-3 rounded-full bg-black ring-4 ring-black/10 z-10" />
                            <div className="absolute left-[31px] top-[40px] bottom-0 w-[2px] bg-black/5 group-hover:bg-black/10 transition-colors" />
                            <div className="flex-1 relative">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pickup Location</label>
                                <input 
                                    type="text" 
                                    value={pickup}
                                    onChange={handlePickupChange}
                                    onFocus={() => { if (pickupSuggestions.length > 0) setShowPickupSuggestions(true); }}
                                    className="w-full bg-transparent border-none focus:ring-0 outline-none text-[13px] font-black p-0 text-black placeholder:text-gray-300"
                                    placeholder="Enter pickup point"
                                />
                                {isPickupSearching && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-black/5 rounded-3xl mt-2 p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-xl z-[70] flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                                        Searching Pickup...
                                    </div>
                                )}
                                {showPickupSuggestions && !isPickupSearching && (
                                    <div className="absolute top-full left-0 w-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/5 rounded-3xl mt-2 z-[70] overflow-hidden">
                                        {pickupSuggestions.length > 0 ? (
                                            pickupSuggestions.map((s, i) => (
                                                <button 
                                                    key={i}
                                                    onClick={() => {
                                                        setPickup(s)
                                                        setShowPickupSuggestions(false)
                                                    }}
                                                    className="w-full px-6 py-4 text-left text-xs font-bold hover:bg-black/5 flex items-center gap-3 transition-colors text-black border-b border-black/[0.03] last:border-b-0"
                                                >
                                                    <MapPin size={14} className="text-gray-300" />
                                                    {s}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-6 text-center">
                                                <Info size={20} className="mx-auto text-gray-300 mb-2" />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No matching locations found</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={handleLocationClick}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isLocating ? 'bg-black text-white' : 'bg-black/5 text-black/40 hover:bg-black/10 hover:text-black'}`}
                            >
                                <LocateFixed size={18} className={isLocating ? 'animate-pulse' : ''} />
                            </button>
                        </div>
                        
                        <div className="h-[1px] bg-black/5 mx-6" />

                        {/* Dropoff */}
                        <div className="p-6 flex items-center gap-5 relative group">
                            <div className="w-3 h-3 bg-black ring-4 ring-black/10 rotate-45 z-10" />
                            <div className="flex-1 relative">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Destination</label>
                                <input 
                                    type="text" 
                                    value={dropoff}
                                    onChange={handleDropoffChange}
                                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                    className="w-full bg-transparent border-none focus:ring-0 outline-none text-[13px] font-black p-0 text-black placeholder:text-gray-300"
                                    placeholder="Where to?"
                                />
                                {isDropoffSearching && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-black/5 rounded-3xl mt-2 p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-xl z-[70] flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                                        Searching Destination...
                                    </div>
                                )}
                                {showSuggestions && !isDropoffSearching && (
                                    <div className="absolute top-full left-0 w-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/5 rounded-3xl mt-2 z-[70] overflow-hidden">
                                        {suggestions.length > 0 ? (
                                            suggestions.map((s, i) => (
                                                <button 
                                                    key={i}
                                                    onClick={() => {
                                                        setDropoff(s)
                                                        setShowSuggestions(false)
                                                    }}
                                                    className="w-full px-6 py-4 text-left text-xs font-bold hover:bg-black/5 flex items-center gap-3 transition-colors text-black border-b border-black/[0.03] last:border-b-0"
                                                >
                                                    <MapPin size={14} className="text-gray-300" />
                                                    {s}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-6 text-center">
                                                <Info size={20} className="mx-auto text-gray-300 mb-2" />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No matching locations found</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-black/40 hover:bg-black/10 hover:text-black transition-all">
                                <Search size={18} />
                            </button>
                        </div>
                    </div>
                </section>

            </main>

            {/* Sticky Bottom Action */}
            <div className="fixed bottom-0 left-0 w-full p-6 md:p-8 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
                <div className="max-w-xl mx-auto pointer-events-auto">
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-black text-white py-6 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/40 hover:bg-gray-900 transition-all flex items-center justify-center gap-4 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span>Continue to Book</span>
                        <ChevronLeft size={20} className="rotate-180" />
                    </motion.button>
                </div>
            </div>
        </div>
    )
}
