'use client'
import { motion } from 'motion/react'
import React from 'react'
import { Bike, Car, Bus, Truck, Search } from 'lucide-react'

interface HerosectionProps {
    onBookNow?: () => void;
}

function Herosection({ onBookNow }: HerosectionProps) {
    return (
        <div className='relative min-h-screen w-full overflow-hidden font-sans text-white'>
            {/* Background Image with Overlay */}
            <div className='absolute inset-0 bg-cover bg-center transition-transform duration-1000' 
                 style={{ backgroundImage: "url('/hero_map.png')", transform: 'scale(1.05)' }} />
            
            <div className='absolute inset-0 bg-black/60 backdrop-blur-[1px]' />
            <div className='absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80' />

            {/* Main Content */}
            <div className='relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 pt-20'>
                <motion.h1 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className='text-5xl md:text-8xl font-bold mb-6 tracking-tighter'
                >
                    Book Any Vehicle
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className='text-lg md:text-2xl font-medium mb-16 max-w-3xl text-white/50'
                >
                    From daily rides to heavy transport — all in one platform.
                </motion.p>

                {/* Vehicle Icons */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className='flex flex-wrap justify-center gap-8 md:gap-12 mb-10 md:mb-16 opacity-40'
                >
                    <Bike className='w-6 h-6 md:w-8 md:h-8 hover:opacity-100 transition-opacity cursor-pointer' />
                    <Car className='w-6 h-6 md:w-8 md:h-8 hover:opacity-100 transition-opacity cursor-pointer' />
                    <Bus className='w-6 h-6 md:w-8 md:h-8 hover:opacity-100 transition-opacity cursor-pointer' />
                    <Truck className='w-6 h-6 md:w-8 md:h-8 hover:opacity-100 transition-opacity cursor-pointer' />
                </motion.div>

                {/* Call to Action Button */}
                <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255, 255, 255, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.4, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                    onClick={onBookNow}
                    className='bg-white text-black px-10 md:px-16 py-4 md:py-5 rounded-full text-lg md:text-xl font-black uppercase tracking-wider hover:bg-white/90 transition-all'
                >
                    Book Now
                </motion.button>
            </div>

            {/* Bottom Overlay for seamless transition to next section */}
            <div className='absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-0' />
        </div>
    )
}

export default Herosection