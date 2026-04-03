'use client'
import React from 'react'
import { motion } from 'motion/react'

function Navbar({ onLogin }: { onLogin?: () => void }) {
    return (
        <nav className='fixed top-0 left-0 w-full z-50 py-4 px-8'>
            <div className='max-w-7xl mx-auto flex items-center justify-between bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-3'>
                {/* Logo */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className='text-2xl font-black tracking-tighter uppercase text-white flex-shrink-0'
                >
                    Go<span className='text-white/60'>Ride</span>
                </motion.div>
                
                {/* Center Links */}
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className='hidden md:flex gap-8 text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 absolute left-1/2 -translate-x-1/2'
                >
                    <a href="#" className='text-white transition-colors'>Home</a>
                    <a href="#" className='hover:text-white transition-colors'>Bookings</a>
                    <a href="#" className='hover:text-white transition-colors'>About Us</a>
                    <a href="#" className='hover:text-white transition-colors'>Contact</a>
                </motion.div>

                {/* Right Side Login Button */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <button 
                        onClick={onLogin}
                        className='bg-white text-black px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-lg'
                    >
                        Login
                    </button>
                </motion.div>
            </div>
        </nav>
    )
}

export default Navbar