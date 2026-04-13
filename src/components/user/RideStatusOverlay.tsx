'use client'
import React from 'react'
import { Car, Phone } from 'lucide-react'
import ChatBox from '@/components/ChatBox'

interface RideStatusOverlayProps {
    bookingStatus: 'searching' | 'accepted';
    activeVehicle: any;
    assignedPartner: any;
    currentOtp: string | null;
    setBookingStatus: (status: 'idle') => void;
    setIsTripStarted: (started: boolean) => void;
}

export default function RideStatusOverlay({
    bookingStatus, activeVehicle, assignedPartner, currentOtp, setBookingStatus, setIsTripStarted
}: RideStatusOverlayProps) {

    if (bookingStatus === 'searching') {
        return (
            <div className="w-full bg-white flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="relative w-32 h-32 flex items-center justify-center mx-auto mb-8">
                    <div className="absolute inset-0 bg-black/5 rounded-full animate-ping"></div>
                    <div className="absolute inset-4 bg-black/10 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                    <div className="absolute inset-8 bg-black/20 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
                    <Car className="w-8 h-8 text-black relative z-10" />
                </div>
                <h2 className="text-3xl font-black text-black tracking-tight">Finding your partner...</h2>
                <p className="text-gray-500 font-medium text-sm">We are dispatching your request to nearby {activeVehicle?.name} drivers.</p>

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
        );
    }

    return (
        <div className="w-full bg-white flex flex-col p-8 overflow-y-auto">
            <div className="flex-1 flex flex-col justify-center items-center text-center relative">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <Car size={32} className="text-green-500" />
                </div>
                <h2 className="text-3xl font-black text-black mb-2 tracking-tight">Driver Confirmed!</h2>
                <p className="text-gray-500 font-medium text-sm mb-8">
                    {assignedPartner?.name || 'A partner'} is on their way to pick you up in a {activeVehicle?.name}.
                </p>

                <div className="w-full bg-gray-50 rounded-[2rem] p-6 border border-gray-100 mb-8 flex items-center gap-4 text-left relative">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex overflow-hidden shrink-0">
                        <img src="https://ui-avatars.com/api/?name=Partner&background=0D8ABC&color=fff" alt="Driver" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-black pr-10">{assignedPartner?.name || 'Amit Kumar'}</h3>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                ★ {assignedPartner?.rating || '5.0'}
                            </div>
                            {currentOtp && (
                                <div className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1 rounded-full shadow-lg shadow-blue-500/20">
                                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-80">OTP:</span>
                                    <span className="text-sm font-black tracking-widest">{currentOtp}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <a href={`tel:${assignedPartner?.phone || '+919112233445'}`} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors active:scale-95 z-30" title="Call Driver">
                        <Phone size={20} className="fill-white" />
                    </a>
                </div>

                <div className="w-full flex-1 flex flex-col mb-8 min-h-[400px]">
                    <ChatBox
                        role="user"
                        variant="inline"
                        rideId={currentOtp || 'dummy-ride-123'}
                        partnerName={assignedPartner?.name || 'Amit Kumar'}
                    />
                </div>

                <button
                    onClick={() => {
                        setBookingStatus('idle')
                        setIsTripStarted(false)
                    }}
                    className="w-full py-4 bg-black text-white rounded-2xl font-black text-lg hover:bg-gray-900 transition-all active:scale-95 shadow-xl shadow-black/20"
                >
                    Cancel Trip
                </button>
            </div>
        </div>
    );
}
