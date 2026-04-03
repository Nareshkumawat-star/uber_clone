'use client'
import React from 'react'
import { motion } from 'motion/react'
import { Globe, Mail, Phone, MapPin } from 'lucide-react'

function Footer() {
    return (
        <footer className="bg-black text-white pt-20 pb-10 px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                {/* Brand Section */}
                <div className="col-span-1 md:col-span-1">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-2xl font-black tracking-tighter uppercase mb-6"
                    >
                        Go<span className="text-white/60">Ride</span>
                    </motion.div>
                    <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                        The ultimate platform for all your transportation needs. From rides to heavy transport, we've got you covered.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-40">Company</h4>
                    <ul className="space-y-4 text-sm font-medium text-white/70">
                        <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                    </ul>
                </div>

                {/* Product Links */}
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-40">Product</h4>
                    <ul className="space-y-4 text-sm font-medium text-white/70">
                        <li><a href="#" className="hover:text-white transition-colors">How it works</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Services</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
                    </ul>
                </div>

                {/* Contact & Socials Placeholder */}
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-40">Contact</h4>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors cursor-pointer">
                            <Mail className="w-4 h-4" /> <span>support@goride.com</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors cursor-pointer">
                            <Phone className="w-4 h-4" /> <span>+1 (555) 000-0000</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors cursor-pointer">
                            <Globe className="w-4 h-4" /> <span>Worldwide</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:row items-center justify-between gap-4">
                <p className="text-xs text-white/30 font-medium tracking-tight">
                    © 2024 GoRide Inc. All rights reserved.
                </p>
                <div className="flex gap-8 text-[10px] uppercase font-bold tracking-widest text-white/30">
                    <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
                </div>
            </div>
        </footer>
    )
}

export default Footer