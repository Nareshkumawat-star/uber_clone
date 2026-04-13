'use client'
import React from 'react'
import { Navigation2, Navigation, Loader2, MapPin, MapPinIcon, Clock, CreditCard, ChevronRight } from 'lucide-react'

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
        <div className="w-full bg-white flex flex-col pt-0">
            {/* Input Section */}
            <div className="p-6 md:p-8 bg-white border-b border-gray-100 relative z-30">
                <h1 className="text-3xl font-black text-black tracking-tight mb-8">Get a ride</h1>

                <div className="relative">
                    <div className="absolute left-[20px] top-[24px] bottom-[28px] w-0.5 bg-black/10 z-0" />

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
                                        if (selectedDestination) setSelectedDestination(null);
                                    }}
                                />
                                {isSearching && <Loader2 size={16} className="animate-spin text-gray-400" />}
                            </div>
                        </div>

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

            <div className="flex-1 overflow-hidden flex flex-col bg-[#f8f9fa] relative z-10">
                {selectedDestination ? (
                    <>
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
                        {/* Empty state UI */}
                    </div>
                )}
            </div>
        </div>
    );
}
