import React, { useState, useEffect } from 'react'
import { Car, Phone, ChevronDown, CheckCircle2, MessageSquare, ShieldCheck, MapPin, Clock, AlertCircle } from 'lucide-react'
import ChatBox from '@/components/ChatBox'
import { useSocket } from '@/components/SocketProvider'
import { motion, AnimatePresence } from 'motion/react'

interface RideStatusOverlayProps {
    bookingStatus: 'searching' | 'accepted';
    activeVehicle: any;
    assignedPartner: any;
    currentOtp: string | null;
    isTripStarted: boolean;
    setBookingStatus: (status: 'idle') => void;
    setIsTripStarted: (started: boolean) => void;
    onTripComplete: () => void;
    onCancel: () => void;
}

export default function RideStatusOverlay({
    bookingStatus, activeVehicle, assignedPartner, currentOtp, isTripStarted,
    setBookingStatus, setIsTripStarted, onTripComplete, onCancel
}: RideStatusOverlayProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { socket } = useSocket();

    if (bookingStatus === 'searching') {
        return (
            <div className="w-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center animate-pulse">
                    <Car className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-base font-black tracking-tight uppercase">Searching</h2>
                    <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase">Connecting to partner...</p>
                </div>
                <button onClick={onCancel} className="text-[10px] font-black uppercase text-gray-300 hover:text-black transition-colors pt-4">Cancel Request</button>
            </div>
        );
    }

    return (
        <div className="w-full space-y-3">
            {/* Status Header - Small Card */}
            <div className="p-4 bg-black text-white rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        {isTripStarted ? <Clock size={16} /> : <MapPin size={16} />}
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{isTripStarted ? 'Trip In Progress' : 'Partner Arriving'}</p>
                        <p className="text-xs font-black">{assignedPartner?.name || 'Partner'}</p>
                    </div>
                </div>
                {!isTripStarted && currentOtp && (
                    <div className="bg-white text-black px-2 py-1 rounded-lg text-[10px] font-black">OTP {currentOtp}</div>
                )}
            </div>

            {/* Partner Details - Compact */}
            <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <p className="text-[10px] font-black">+91 91122 33445</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-gray-400" />
                    <p className="text-[10px] font-black uppercase">Verified</p>
                </div>
            </div>

            {/* Chat Box - Small Card */}
            <div className="h-64 bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col">
                <div className="px-3 py-2 border-b border-gray-50 flex items-center justify-between">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Chat Message</span>
                    <MessageSquare size={12} className="text-gray-200" />
                </div>
                <ChatBox
                    role="user"
                    variant="inline"
                    rideId={currentOtp || 'dummy-ride-123'}
                    partnerName={assignedPartner?.name || 'Partner'}
                />
            </div>

            {/* Action - Small Button */}
            <button
                onClick={onCancel}
                className="w-full py-3 text-red-100 bg-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2"
            >
                <AlertCircle size={14} /> {isTripStarted ? 'SOS / STOP' : 'Cancel Trip'}
            </button>
        </div>
    );
}
