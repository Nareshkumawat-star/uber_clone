'use client'
import React from 'react'
import { Navigation2, Navigation, Loader2, MapPin, Grid, Clock, CreditCard, ChevronRight, History, Heart, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface BookingFormProps {
    pickup: string;
    setPickup: (val: string) => void;
    destQuery: string;
    setDestQuery: (val: string) => void;
    handleRecenter: () => void;
    loading: boolean;
    isSearching: boolean;
    suggestions: any[];
    handleSelectSuggestion: (place: any) => void;
    selectedDestination: any;
    setSelectedDestination: (val: any) => void;
    vehicles: any[];
    activeVehicleId: string;
    setActiveVehicleId: (id: string) => void;
    handleBookRide: () => void;
}

export default function BookingForm({
    pickup, setPickup, destQuery, setDestQuery, handleRecenter, loading, isSearching,
    suggestions, handleSelectSuggestion, selectedDestination, setSelectedDestination,
    vehicles, activeVehicleId, setActiveVehicleId, handleBookRide
}: BookingFormProps) {
    const activeVehicle = vehicles.find(v => v.id === activeVehicleId);

    return (
        <div className="w-full h-full flex flex-col space-y-4">
            {/* Input Section - Compact */}
            <div className="space-y-3">
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-black bg-white z-10" />
                    <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-10 text-xs font-bold focus:outline-none focus:border-black transition-all"
                        placeholder="Pickup"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                    />
                    <button onClick={handleRecenter} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black"><Navigation size={14} /></button>
                </div>

                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-black z-10" />
                    <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-10 text-xs font-bold focus:outline-none focus:border-black transition-all"
                        placeholder="Where to?"
                        value={destQuery}
                        onChange={(e) => {
                            setDestQuery(e.target.value);
                            if (selectedDestination) setSelectedDestination(null);
                        }}
                    />
                    {isSearching && <Loader2 size={14} className="animate-spin text-gray-300 absolute right-3 top-1/2 -translate-y-1/2" />}
                    
                    <AnimatePresence>
                        {suggestions.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100] p-1">
                                {suggestions.map((place, idx) => (
                                    <div key={idx} onClick={() => handleSelectSuggestion(place)} className="p-3 hover:bg-black hover:text-white group cursor-pointer flex gap-3 rounded-lg transition-all">
                                        <MapPin size={14} className="shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-black line-clamp-1">{place.display_name.split(',')[0]}</p>
                                            <p className="text-[9px] font-bold text-gray-400 group-hover:text-white/50 line-clamp-1">{place.display_name}</p>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Vehicle Selection - Compact Grid or Small Cards */}
            <div className="flex-1 min-h-0 flex flex-col">
                <AnimatePresence mode="wait">
                    {selectedDestination ? (
                        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1 py-4">
                                {vehicles.map((v) => {
                                    const isSelected = activeVehicleId === v.id;
                                    return (
                                        <div key={v.id} onClick={() => setActiveVehicleId(v.id)} className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${isSelected ? 'border-black bg-black text-white' : 'border-transparent bg-gray-50'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white' : 'bg-white'}`}>
                                                    <img src={v.img} alt={v.name} className="w-8 object-contain mix-blend-multiply" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black">{v.name}</p>
                                                    <p className={`text-[9px] font-bold ${isSelected ? 'text-white/50' : 'text-gray-400'}`}>{v.time} • Secure</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-black tracking-tighter">{v.price}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={handleBookRide} className="w-full py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest mt-auto">Book {activeVehicle?.name}</button>
                        </motion.div>
                    ) : (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                            <MapPin size={24} className="mb-2 opacity-20" />
                            <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed">Input destination <br/> to see options</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
