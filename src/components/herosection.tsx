'use client'
import { motion } from 'motion/react'
import React from 'react'
import { Bike, Car, Bus, Truck, ArrowRight } from 'lucide-react'

interface HerosectionProps {
    onBookNow?: () => void;
}

function Herosection({ onBookNow }: HerosectionProps) {
    return (
        <div className='relative min-h-[90vh] w-full overflow-hidden font-sans text-black bg-white flex flex-col items-center justify-center text-center px-6 py-20'>
            {/* Minimal Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle, black 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-100 mb-8 bg-gray-50">
                    <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Next Gen Transport</span>
                </div>
                
                <h1 className='text-5xl sm:text-7xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.9] uppercase'>
                    Ride Simple<br/>Travel <span className="text-gray-200">Better</span>
                </h1>

                <p className='text-base md:text-xl font-medium mb-12 max-w-2xl mx-auto text-gray-400 leading-relaxed uppercase tracking-widest'>
                    Predictable pricing, premium vehicles, and instant booking wherever you are.
                </p>

                <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onBookNow}
                        className='w-full sm:w-auto bg-black text-white px-12 py-5 rounded-2xl text-base font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10'
                    >
                        Book Now
                    </motion.button>
                    <button className="w-full sm:w-auto py-5 px-12 rounded-2xl text-base font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                        Features <ArrowRight size={18} />
                    </button>
                </div>
            </motion.div>

            {/* Bottom Floating Icons - Monochrome */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className='flex gap-8 md:gap-16 mt-20 opacity-20'
            >
                <Bike size={24} />
                <Car size={24} />
                <Bus size={24} />
                <Truck size={24} />
            </motion.div>
        </div>
    )
}

export default Herosection