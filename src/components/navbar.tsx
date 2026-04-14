'use client'
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux/store'
import { ChevronRight, LogOut, User as UserIcon, Menu, X, Timer } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { setUser } from '@/redux/userSlice'
import { useRouter } from 'next/navigation'

function Navbar({ onLogin }: { onLogin?: () => void }) {
    const [profileopen, setprofileopen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { userdata } = useSelector((state: RootState) => state.user)
    const dispatch = useDispatch()
    const router = useRouter()

    const signout = async () => {
        await signOut()
        dispatch(setUser(null))
        setprofileopen(false)
    }

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Partner', href: '/partner/dashboard' },
        { name: 'Book', href: '/user/book' },
    ]

    return (
        <nav className='fixed top-0 left-0 w-full z-50 p-4'>
            <div className='max-w-7xl mx-auto flex items-center justify-between bg-white border border-gray-100 shadow-xl rounded-2xl px-6 py-3'>
                {/* Logo */}
                <div onClick={() => router.push('/')} className="flex items-center gap-2 cursor-pointer">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                        <Timer className="text-white w-4 h-4" />
                    </div>
                    <h1 className="text-lg font-black tracking-tighter uppercase">GoRide</h1>
                </div>

                {/* Desktop Menu */}
                <div className='hidden md:flex gap-10 text-[10px] font-black uppercase tracking-[0.2em]'>
                    {navLinks.map((link) => (
                        <a key={link.name} href={link.href} className="text-gray-400 hover:text-black transition-colors">{link.name}</a>
                    ))}
                </div>

                {/* Right Actions */}
                <div className='flex items-center gap-4'>
                    {userdata ? (
                        <div className="relative">
                            <button
                                onClick={() => setprofileopen(!profileopen)}
                                className='w-9 h-9 border border-gray-100 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all overflow-hidden'
                            >
                                <UserIcon size={16} />
                            </button>
                            <AnimatePresence>
                                {profileopen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className='absolute right-0 top-12 bg-white rounded-2xl shadow-2xl p-6 w-64 border border-gray-50 z-[100]'
                                    >
                                        <div className='space-y-4 text-left'>
                                            <div>
                                                <p className='text-sm font-black uppercase'>{userdata.name}</p>
                                                <p className='text-[10px] text-gray-400 font-bold uppercase'>{userdata.role}</p>
                                            </div>
                                            <div className='pt-4 border-t border-gray-50 space-y-1'>
                                                <button onClick={() => router.push('/partner/onboarding/vehicle')} className="w-full text-left text-[10px] font-black uppercase py-2 hover:text-black text-gray-400 flex justify-between items-center group">
                                                    Become a Partner <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                                </button>
                                                <button onClick={signout} className="w-full text-left text-[10px] font-black uppercase py-2 text-red-400 hover:text-red-500">Log out</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <button onClick={onLogin} className='bg-black text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all'>Login</button>
                    )}
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className='md:hidden text-black'><Menu size={20} /></button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className='md:hidden absolute top-20 left-4 right-4 bg-white border border-gray-100 rounded-2xl shadow-2xl p-6 z-[60]'
                    >
                        <div className='flex flex-col gap-6 text-[10px] font-black uppercase tracking-[0.2em]'>
                            {navLinks.map((link) => (
                                <a key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-gray-400 border-b border-gray-50 pb-4">{link.name}</a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default Navbar