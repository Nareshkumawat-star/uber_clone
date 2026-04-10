'use client'
import React from 'react'
import PriceModel from '@/components/PriceModel'
import { motion } from 'motion/react'

export default function PricingOnboardingPage() {
    return (
        <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-xl"
            >
                <PriceModel />
                
                <div className="mt-8 flex flex-col items-center text-center px-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                        Secure Submission
                    </p>
                    <p className="text-[9px] text-gray-300 font-medium leading-relaxed max-w-xs">
                        By completing this setup, your profile will be sent for a final review. You can adjust these prices later from your dashboard.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
