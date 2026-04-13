'use client'
import React from 'react'
import { LogOut, MapPin as MapPinIcon, Navigation, ShieldCheck, Phone } from 'lucide-react'
import ChatBox from '@/components/ChatBox'

interface ActiveTripOverlayProps {
    activeRide: any;
    tripStatus: 'approaching' | 'ongoing' | 'completed';
    isSimulating: boolean;
    setIsSimulating: (val: boolean) => void;
    setActiveRide: (val: any) => void;
    setIsVerified: (val: boolean) => void;
    setOtpInput: (val: string) => void;
    isVerified: boolean;
    otpInput: string;
    handleVerifyOtp: () => void;
    setTripStatus: (status: 'approaching' | 'ongoing' | 'completed') => void;
}

export default function ActiveTripOverlay({
    activeRide, tripStatus, isSimulating, setIsSimulating, setActiveRide, setIsVerified,
    setOtpInput, isVerified, otpInput, handleVerifyOtp, setTripStatus
}: ActiveTripOverlayProps) {
    if (!activeRide) return null;

    return (
        <div className="w-full flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100">
            <div className="bg-black p-8 text-white">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-white/10 rounded-full">Active Trip</span>
                    <div className="flex gap-2">
                        {/* Removed simulation/logout buttons */}
                    </div>
                </div>
                <h2 className="text-3xl font-black mb-1">
                    {tripStatus === 'approaching' ? 'Pick up Rider' : tripStatus === 'ongoing' ? 'In Progress' : 'Completed'}
                </h2>
                <p className="text-white/50 text-sm font-medium">Trip to {activeRide.destinationAddress?.split(',')[0] || 'Destination'}</p>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
                <div className="space-y-8">
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

                    {/* Rider Profile Card */}
                    <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 flex items-center gap-4 relative">
                        <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden shrink-0">
                            <img src="https://ui-avatars.com/api/?name=Rider&background=random&color=fff" alt="Rider" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 pr-10">{activeRide.riderName || 'Rahul Sharma'}</h3>
                            <p className="text-xs font-bold text-amber-500">★ 4.9 Rating</p>
                        </div>
                        <a href={`tel:${activeRide.riderPhone || '+919988776655'}`} className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors active:scale-95" title="Call Rider">
                            <Phone size={16} className="fill-white" />
                        </a>
                    </div>

                    <div className="w-full flex-1 border border-gray-100 rounded-[2rem] overflow-hidden min-h-[350px] flex flex-col">
                        <ChatBox
                            role="partner"
                            variant="inline"
                            rideId={activeRide.otp || 'dummy-ride-123'}
                            partnerName={activeRide.riderName || 'Rahul Sharma'}
                        />
                    </div>

                    {!isVerified ? (
                        <div className="bg-blue-50 rounded-[2rem] p-8 border border-blue-100">
                            <div className="flex items-center gap-3 mb-4">
                                <ShieldCheck className="text-blue-600" size={24} />
                                <h4 className="font-black text-blue-900">Verify Identity</h4>
                            </div>
                            <p className="text-blue-700/70 text-sm font-medium mb-6">
                                Ask the rider for their 4-digit code to start the trip.
                            </p>

                            <div className="flex gap-4 justify-center mb-10">
                                {Array(4).fill(0).map((_, i) => (
                                    <input
                                        key={i}
                                        id={`otp-${i}`}
                                        type="text"
                                        maxLength={1}
                                        value={otpInput[i] || ''}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            const newOtp = otpInput.split('');
                                            newOtp[i] = val;
                                            setOtpInput(newOtp.join(''));
                                            if (val && i < 3) {
                                                const next = document.getElementById(`otp-${i + 1}`);
                                                if (next) next.focus();
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !otpInput[i] && i > 0) {
                                                const prev = document.getElementById(`otp-${i - 1}`);
                                                if (prev) prev.focus();
                                            }
                                        }}
                                        className="w-14 h-16 bg-white border-2 border-blue-200 rounded-xl text-center text-3xl font-black focus:border-blue-500 focus:outline-none transition-all text-black shadow-inner"
                                    />
                                ))}
                            </div>

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
                                    setTripStatus('approaching');
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
    );
}
