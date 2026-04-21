'use client'
import { useEffect, useState } from 'react'
import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { Check, Lock, ChevronRight, XCircle } from 'lucide-react'
import { motion } from 'motion/react'
import axios from 'axios'

import { useRouter } from 'next/navigation'

type Step = {
    id: number;
    title: string;
    route?: string;
}

const STEPS: Step[] = [
    { id: 1, title: "Vehicle", route: "/partner/onboarding/vehicle" },
    { id: 2, title: "Documents", route: "/partner/onboarding/Documents" },
    { id: 3, title: "Bank", route: "/partner/onboarding/Bank" },
    { id: 4, title: "Review" },
    { id: 5, title: "Video KYC" },
    { id: 6, title: "Pricing", route: "/partner/onboarding/pricing" },
    { id: 7, title: "Final Review" },
    { id: 8, title: "Live" },
];

function PartnerDashboard() {
    const [activesteps, setactivesteps] = useState(0);
    const [rejected, setRejected] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const { userdata } = useSelector((state: RootState) => state.user)
    const router = useRouter()
   const[pricing , setpricing] = useState(false)
    useEffect(() => {
        if (userdata) {
            if (userdata.role === 'admin') {
                router.push('/')
                return
            }

            const currentStep = userdata.partneronbaordingsteps || 0;
            setactivesteps(currentStep)

            // Check if review was rejected (at step 3)
            if (currentStep === 3) {
                axios.get('/api/partner/onboard/document').then(res => {
                    if (res.data?.docs?.status === 'rejected') {
                        setRejected(true)
                        setRejectionReason(res.data.docs.rejectionreason || 'Your application was rejected by admin.')
                    }
                }).catch(() => {})
            }
        }
    }, [userdata, router])

    return (
        <div className="w-full min-h-screen bg-white flex flex-col items-center py-12 px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl w-full"
            >
                <div className="mb-10 md:mb-16 text-center px-2">
                    <h1 className="text-3xl md:text-5xl font-black text-black mb-3 tracking-tight">Onboarding</h1>
                    <p className="text-gray-400 text-base md:text-lg font-medium">Your journey to becoming a GoRide partner</p>
                </div>

                {/* Progress Bar Container - Responsive Scroll */}
                <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-12 mb-12 relative">
                    <div className="overflow-x-auto pb-8 -mb-8 scrollbar-hide">
                        <div className="relative flex items-center justify-between min-w-[700px] md:min-w-full px-4 py-4">
                            
                            {/* Progress Line Container - Inset to match circle centers (w-12 circles => 24px/left-6 inset) */}
                            <div className="absolute top-[42px] left-6 right-6 h-[2px] -z-0 bg-gray-50">
                                {/* Connecting Line Active */}
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(Math.min(activesteps, STEPS.length - 1) / (STEPS.length - 1)) * 100}%` }}
                                    className="h-full bg-black transition-all duration-1000 ease-in-out origin-left"
                                />
                            </div>

                            {STEPS.map((step, index) => {
                                const isCompleted = index < activesteps;
                                const isCurrent = index === activesteps;
                                const isLocked = index > activesteps;

                                return (
                                    <div 
                                        key={step.id} 
                                        className="relative z-10 flex flex-col items-center gap-4 cursor-pointer"
                                        onClick={() => {
                                            if (step.route && (index <= activesteps)) {
                                                router.push(step.route)
                                            } else if (index === 4 && activesteps === 4 && userdata?._id) {
                                                // special case for video kyc which has dynamic route
                                                router.push(`/videokyc/${userdata._id}`)
                                            }
                                        }}
                                    >
                                        {/* Step Circle */}
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                                isCompleted 
                                                    ? "bg-black border-black text-white shadow-lg shadow-black/10" 
                                                    : isCurrent 
                                                        ? "bg-white border-black text-black ring-8 ring-black/5 shadow-xl" 
                                                        : "bg-white border-gray-100 text-gray-200"
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <Check className="w-6 h-6 stroke-[3px]" />
                                            ) : isLocked ? (
                                                <Lock className="w-4 h-4 opacity-30" />
                                            ) : (
                                                <span className="text-sm font-black">{step.id}</span>
                                            )}
                                        </motion.div>

                                        {/* Step Label */}
                                        <span className={`text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                            isCurrent ? "text-black translate-y-1" : isCompleted ? "text-gray-400" : "text-gray-200"
                                        }`}>
                                            {step.title}
                                        </span>
                                        
                                        {/* Pulse effect for current step */}
                                        {isCurrent && (
                                            <div className="absolute top-0 left-0 w-12 h-12 rounded-full bg-black/5 animate-ping -z-10" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20">
                    <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-black/5 transition-all">
                        <h3 className="font-bold text-xl mb-3 text-black">Account Status</h3>
                        {rejected ? (
                            <>
                                <p className="text-gray-500 text-sm leading-relaxed mb-3">
                                    Your application has been reviewed and was not approved at this time.
                                </p>
                                {rejectionReason && (
                                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
                                        <p className="text-xs font-medium text-red-600">
                                            <span className="font-bold">Reason:</span> {rejectionReason}
                                        </p>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                                    <XCircle className="w-4 h-4" />
                                    Review Rejected
                                </div>
                            </>
                        ) : activesteps === 8 ? (
                            <>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                    Congratulations! Your account is now fully approved and active. You can start receiving ride requests.
                                </p>
                                <div className="flex items-center gap-2 text-black font-semibold text-sm">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Account Active & Live
                                </div>
                            </>
                        ) : activesteps >= 6 ? (
                            <>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                    Everything is set up. Our team is performing a final quality check before going live.
                                </p>
                                <div className="flex items-center gap-2 text-black font-semibold text-sm">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    Final Review in Progress
                                </div>
                            </>
                        ) : activesteps === 5 ? (
                            <>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                    Final step! Configure your ride pricing to start receiving bookings.
                                </p>
                                <div className="flex items-center gap-2 text-black font-semibold text-sm">
                                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                                    Pricing Setup Pending
                                </div>
                            </>
                        ) : activesteps === 4 ? (
                            <>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                    Your documents have been approved! Please complete the Video KYC to proceed.
                                </p>
                                <div className="flex items-center gap-2 text-black font-semibold text-sm">
                                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                    Video KYC Pending
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                    You have successfully submitted your information. Our team is currently reviewing your profile.
                                </p>
                                <div className="flex items-center gap-2 text-black font-semibold text-sm">
                                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                                    Initial Review Pending
                                </div>
                            </>
                        )}
                    </div>
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            if (activesteps === 8) {
                                router.push('/partner/dashboard')
                            } else if (activesteps === 4 && userdata?._id) {
                                router.push(`/videokyc/${userdata._id}`)
                            } else {
                                const nextStep = STEPS[activesteps];
                                if (nextStep?.route) {
                                    router.push(nextStep.route)
                                } else {
                                    alert(`Next step: ${nextStep?.title || 'Unknown'}. Hold tight, we are setting it up!`)
                                }
                            }
                        }}
                        className="p-8 bg-black text-white rounded-2xl shadow-xl hover:shadow-black/20 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                        <div>
                            <h3 className="font-bold text-xl mb-2 text-white">
                                {activesteps === 8 ? 'Dashboard' : activesteps === 4 ? 'Video KYC' : 'Next Step'}
                            </h3>
                            <p className="text-white/60 text-sm mb-6">
                                {activesteps === 8 
                                    ? 'Your account is live! Go to your driver dashboard to start earning.'
                                    : activesteps === 4 
                                        ? 'Click to join the Video KYC call with our verification team.' 
                                        : `Complete the upcoming ${STEPS[activesteps]?.title} to proceed.`
                                }
                            </p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                            <span className="font-bold text-lg">
                                {activesteps === 8 ? 'Enter Dashboard' : activesteps === 4 ? 'Join Video KYC' : 'Continue'}
                            </span>
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}

export default PartnerDashboard;
