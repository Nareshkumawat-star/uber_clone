import React from 'react'
import { MapPin as MapPinIcon, Navigation, ShieldCheck, Phone, ChevronDown, CheckCircle2, MessageSquare, ExternalLink, Zap } from 'lucide-react'
import ChatBox from '@/components/ChatBox'
import { motion } from 'motion/react'

interface ActiveTripOverlayProps {
    socket: any;
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
    socket, activeRide, tripStatus, isSimulating, setIsSimulating, setActiveRide, setIsVerified,
    setOtpInput, isVerified, otpInput, handleVerifyOtp, setTripStatus
}: ActiveTripOverlayProps) {
    if (!activeRide) return null;

    const navLink = `https://www.google.com/maps/dir/?api=1&destination=${
        tripStatus === 'approaching' 
        ? `${activeRide.pickupCoords.lat},${activeRide.pickupCoords.lng}` 
        : `${activeRide.destinationCoords.lat},${activeRide.destinationCoords.lng}`
    }`;

    return (
        <div className="w-full space-y-2">
            {/* Status Header - Small Monochrome Card */}
            <div className="p-4 bg-black text-white rounded-xl">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">{tripStatus}</span>
                    </div>
                </div>
                <h2 className="text-sm font-black uppercase leading-tight">
                     {tripStatus === 'approaching' ? 'Heading to Pickup' : 'Heading to Dropoff'}
                </h2>
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-white/60 line-clamp-1 flex-1 pr-4">{tripStatus === 'approaching' ? activeRide.pickupAddress : activeRide.destinationAddress}</p>
                    <a href={navLink} target="_blank" rel="noreferrer" className="shrink-0 bg-white text-black p-2 rounded-lg hover:bg-gray-200 transition-all">
                        <Navigation size={14} />
                    </a>
                </div>
            </div>

            {/* Rider Info - Compact Card */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-200">
                         <img src="https://ui-avatars.com/api/?name=Rider&background=000&color=fff" alt="Rider" className="w-full h-full object-cover" />
                     </div>
                     <div>
                         <h4 className="text-[11px] font-black">{activeRide.riderName || 'Rider'}</h4>
                         <p className="text-[9px] font-bold text-gray-400">★ 4.9</p>
                     </div>
                </div>
                <a href={`tel:${activeRide.riderPhone || '+919988776655'}`} className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10">
                    <Phone size={14} className="fill-white" />
                </a>
            </div>

            {/* OTP Verification or Trip Actions */}
            {!isVerified ? (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                    <p className="text-[9px] font-black text-gray-400 uppercase text-center tracking-widest">Enter 4-digit OTP</p>
                    <div className="flex justify-center gap-2">
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
                                className="w-10 h-12 bg-white border border-gray-200 rounded-lg text-center text-xl font-black focus:border-black focus:outline-none transition-all shadow-sm"
                            />
                        ))}
                    </div>
                    <button
                        onClick={handleVerifyOtp}
                        disabled={otpInput.length !== 4}
                        className="w-full py-3 bg-black text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg disabled:opacity-20 disabled:shadow-none transition-all"
                    >
                        Verify & Start
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                     <div className="h-48 bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col">
                         <div className="p-2 border-b border-gray-50 flex items-center justify-between">
                             <span className="text-[9px] font-black text-gray-300 uppercase">Trip Chat</span>
                             <MessageSquare size={12} className="text-gray-200" />
                         </div>
                         <ChatBox
                            role="partner"
                            variant="inline"
                            rideId={activeRide.otp || 'ride-123'}
                            partnerName={activeRide.riderName || 'Rider'}
                        />
                     </div>
                     <button
                        onClick={() => {
                            if (socket) socket.emit('trip_completed', { rideId: activeRide.id || activeRide.otp });
                            localStorage.setItem('tripCompletedSignal', Date.now().toString());
                            setTripStatus('approaching');
                            setActiveRide(null);
                            setIsVerified(false);
                            setOtpInput('');
                        }}
                        className="w-full py-3 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-gray-900 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={14} /> End Trip
                    </button>
                </div>
            )}
        </div>
    );
}
