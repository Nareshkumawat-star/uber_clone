'use client'
import { useEffect, useState } from 'react'
import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { Check, Lock, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'

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
    { id: 6, title: "Pricing" },
    { id: 7, title: "Final Review" },
    { id: 8, title: "Live" },
];

function PartnerDashboard() {
    const [activesteps, setactivesteps] = useState(0);
    const { userdata } = useSelector((state: RootState) => state.user)
    const router = useRouter()

    useEffect(() => {
        if (userdata) {
            if (userdata.role === 'admin') {
                router.push('/')
                return
            }

            const currentStep = userdata.partneronbaordingsteps || 0;
            
            // If onboarding is incomplete, redirect to the correct step
            if (currentStep === 0) {
                router.push('/partner/onboarding/vehicle')
                return
            } else if (currentStep === 1) {
                router.push('/partner/onboarding/Documents')
                return
            } else if (currentStep === 2) {
                router.push('/partner/onboarding/Bank')
                return
            }

            setactivesteps(currentStep)
        }
    }, [userdata, router])

    return (
        <div className="w-full min-h-screen bg-white flex flex-col items-center py-12 px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl w-full"
            >
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-black mb-2">Partner Onboarding</h1>
                    <p className="text-gray-500 text-lg">Your progress in becoming a partner at GoRide</p>
                </div>

                {/* Progress Bar Container */}
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-12 mb-16 relative overflow-hidden">
                    <div className="relative flex items-center justify-between w-full max-w-5xl mx-auto">
                        
                        {/* Connecting Line Background */}
                        <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-100 -z-0" />
                        
                        {/* Connecting Line Active */}
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(Math.min(activesteps, STEPS.length - 1) / (STEPS.length - 1)) * 100}%` }}
                            className="absolute top-5 left-0 h-[2px] bg-black -z-0 transition-all duration-700 ease-out"
                        />

                        {STEPS.map((step, index) => {
                            const isCompleted = index < activesteps;
                            const isCurrent = index === activesteps;
                            const isLocked = index > activesteps;

                            return (
                                <div key={step.id} className="relative z-10 flex flex-col items-center group cursor-pointer">
                                    {/* Step Circle */}
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                            isCompleted 
                                                ? "bg-black border-black text-white" 
                                                : isCurrent 
                                                    ? "bg-white border-black text-black ring-4 ring-black/5 shadow-sm" 
                                                    : "bg-white border-gray-100 text-gray-300"
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-5 h-5 stroke-[3px]" />
                                        ) : isLocked ? (
                                            <Lock className="w-4 h-4 opacity-40" />
                                        ) : (
                                            <span className="text-sm font-bold">{step.id}</span>
                                        )}
                                    </motion.div>

                                    {/* Step Label */}
                                    <div className="absolute -bottom-8 whitespace-nowrap text-center">
                                        <span className={`text-xs font-bold transition-colors duration-300 ${
                                            isCurrent ? "text-black text-sm" : isCompleted ? "text-gray-600" : "text-gray-300"
                                        }`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    
                                    {/* Pulse effect for current step */}
                                    {isCurrent && (
                                        <div className="absolute -inset-1 rounded-full bg-black/5 animate-ping -z-10" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20">
                    <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-black/5 transition-all">
                        <h3 className="font-bold text-xl mb-3 text-black">Account Status</h3>
                        {activesteps === 4 ? (
                            <>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                    Your documents have been approved! Please complete the Video KYC to proceed to the next step.
                                </p>
                                <div className="flex items-center gap-2 text-black font-semibold text-sm">
                                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                    Video KYC Pending
                                </div>
                            </>
                        ) : activesteps >= 5 ? (
                            <>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                    Video KYC has been completed. Continue with the remaining steps.
                                </p>
                                <div className="flex items-center gap-2 text-black font-semibold text-sm">
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                    KYC Approved
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                    You have successfully submitted your primary information. Our team is currently reviewing your application.
                                </p>
                                <div className="flex items-center gap-2 text-black font-semibold text-sm">
                                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                                    Review Pending
                                </div>
                            </>
                        )}
                    </div>
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            if (activesteps === 4 && userdata?._id) {
                                router.push(`/videokyc/${userdata._id}`)
                            } else {
                                const nextStep = STEPS[activesteps];
                                if (nextStep?.route) {
                                    router.push(nextStep.route)
                                } else {
                                    alert(`Next step: ${nextStep?.title}. Hold tight, we are setting it up!`)
                                }
                            }
                        }}
                        className="p-8 bg-black text-white rounded-2xl shadow-xl hover:shadow-black/20 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                        <div>
                            <h3 className="font-bold text-xl mb-2 text-white">
                                {activesteps === 4 ? 'Video KYC' : 'Next Step'}
                            </h3>
                            <p className="text-white/60 text-sm mb-6">
                                {activesteps === 4 
                                    ? 'Click to join the Video KYC call with our verification team.' 
                                    : `Complete the upcoming ${STEPS[activesteps]?.title} to proceed.`
                                }
                            </p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                            <span className="font-bold text-lg">
                                {activesteps === 4 ? 'Join Video KYC' : 'Continue'}
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
