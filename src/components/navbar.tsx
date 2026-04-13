'use client'
import React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { useState } from 'react'
import { ChevronRight, LogOut, User, Settings, Bike, Car, Truck, Menu, X } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { setUser } from '@/redux/userSlice'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'

function Navbar({ onLogin }: { onLogin?: () => void }) {
    const [profileopen, setprofileopen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { userdata } = useSelector((state: RootState) => state.user)
    const dispatch = useDispatch()

    const signout = async () => {
        await signOut()
        dispatch(setUser(null))
        setprofileopen(false)
    }

    const navLinks = [
        { name: 'Home', href: '#' },
        { name: 'Bookings', href: '#' },
        { name: 'About Us', href: '#' },
        { name: 'Contact', href: '#' },
    ]
    const router = useRouter()

    return (
        <nav className='fixed top-0 left-0 w-full z-50 py-4 px-4 md:px-8'>
            <div className='max-w-7xl mx-auto relative'>
                <div className='flex items-center justify-between bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl px-6 md:px-8 py-3'>
                    {/* Hamburger Menu Toggle (Mobile Only) */}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className='md:hidden text-white/70 hover:text-white transition-colors'
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className='text-lg sm:text-x md:text-2xl font-black tracking-tighter uppercase text-white flex-shrink-0'
                    >
                        Go<span className='text-white/60'>Ride</span>
                    </motion.div>

                    {/* Desktop Center Links */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className='hidden md:flex gap-8 text-[10px] font-bold tracking-[0.2em] uppercase absolute left-1/2 -translate-x-1/2'
                    >
                        {navLinks.map((link) => {
                            const isActive = link.name === 'Home'; // Defaulting Home to active as per user request for now
                            return (
                                <a 
                                    key={link.name} 
                                    href={link.href} 
                                    className={`transition-colors ${isActive ? 'text-white font-black' : 'text-white/50 hover:text-white'}`}
                                >
                                    {link.name}
                                </a>
                            );
                        })}
                    </motion.div>

                    {/* Right Side Login/User Button */}
                    <div className='flex items-center gap-4'>
                        {userdata ? (
                            <div className="relative">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                >
                                    <button
                                        onClick={() => setprofileopen(!profileopen)}
                                        className='bg-white text-black w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold uppercase hover:bg-white/90 transition-all shadow-lg overflow-hidden'
                                    >
                                        {userdata.name?.charAt(0).toUpperCase()}
                                    </button>
                                </motion.div>
                                <AnimatePresence>
                                    {profileopen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className='absolute right-0 top-12 md:top-14 bg-white rounded-[1.5rem] shadow-2xl p-6 w-72 z-[60]'
                                        >
                                            <div className='flex flex-col gap-4'>
                                                {/* User Info Section */}
                                                <div>
                                                    <h2 className='text-xl font-bold text-black leading-tight'>
                                                        {userdata.name?.toLowerCase()}
                                                    </h2>
                                                    <p className='text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-0.5'>
                                                        {userdata.role || 'USER'}
                                                    </p>
                                                </div>

                                                {/* Become a Partner Section */}
                                                {userdata.role !== "partner" && (
                                                    <button className='w-full bg-[#F3F3F3] hover:bg-[#EAEAEA] transition-colors rounded-[1rem] p-3 flex items-center justify-between group'  onClick={()=>router.push("/partner/onboarding/vehicle")}>
                                                        <div className='flex items-center gap-2'>
                                                            {/* Overlapping Icons */}
                                                            <div className='flex -space-x-3'>
                                                                <div className='w-7 h-7 rounded-full bg-black border-2 border-[#F3F3F3] flex items-center justify-center text-white z-30'>
                                                                    <Bike size={14} strokeWidth={2.5} />
                                                                </div>
                                                                <div className='w-7 h-7 rounded-full bg-black border-2 border-[#F3F3F3] flex items-center justify-center text-white z-20'>
                                                                    <Car size={14} strokeWidth={2.5} />
                                                                </div>
                                                                <div className='w-7 h-7 rounded-full bg-black border-2 border-[#F3F3F3] flex items-center justify-center text-white z-10'>
                                                                    <Truck size={14} strokeWidth={2.5} />
                                                                </div>
                                                            </div>
                                                            <span className='text-[11px] font-black text-black ml-1 uppercase tracking-tight'>Become a Partner</span>
                                                        </div>
                                                        <ChevronRight size={16} className="text-gray-400 group-hover:text-black transition-colors" />
                                                    </button>
                                                )}

                                                {/* Quick Actions */}
                                                <div className='flex flex-col gap-1.5'>
                                                    <button className="flex items-center gap-3 text-xs font-bold text-black/50 hover:text-black transition-colors py-1.5 px-1 hover:bg-black/5 rounded-lg">
                                                        <User size={16} />
                                                        <span>Profile</span>
                                                    </button>
                                                    <button onClick={signout} className="flex items-center gap-3 text-xs font-bold text-red-500/50 hover:text-red-500 transition-colors py-1.5 px-1 hover:bg-red-500/5 rounded-lg">
                                                        <LogOut size={16} />
                                                        <span>Log out</span>
                                                    </button>
                                                </div>

                                                {/* Email Info */}
                                                <div className='pt-3 border-t border-gray-100'>
                                                    <p className='text-[10px] text-gray-400 font-bold tracking-tight truncate'>
                                                        {userdata.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <button
                                    onClick={onLogin}
                                    className='bg-white text-black px-5 md:px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-lg'
                                >
                                    Login
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className='md:hidden absolute top-full mt-2 w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl z-[40]'
                        >
                            <div className='flex flex-col gap-6 text-[10px] font-bold tracking-[0.2em] uppercase'>
                                {navLinks.map((link) => {
                                    const isActive = link.name === 'Home';
                                    return (
                                        <a 
                                            key={link.name} 
                                            href={link.href} 
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`transition-colors border-b border-white/5 pb-4 ${isActive ? 'text-white font-black' : 'text-white/50 hover:text-white'}`}
                                        >
                                            {link.name}
                                        </a>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    )
}

export default Navbar