'use client'
import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView, useSpring, useTransform } from 'motion/react'
import { Globe, Mail, Phone, MapPin } from 'lucide-react'

function CountUp({ value, suffix = '', decimals = 0 }: { value: number, suffix?: string, decimals?: number }) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: "-100px" })
    
    const spring = useSpring(0, {
        stiffness: 50,
        damping: 30,
        restDelta: 0.001
    })

    const displayValue = useTransform(spring, (latest) => 
        latest.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        })
    )

    useEffect(() => {
        if (inView) {
            spring.set(value)
        }
    }, [inView, value, spring])

    return (
        <span ref={ref}>
            <motion.span>{displayValue}</motion.span>
            {suffix}
        </span>
    )
}

function Footer() {
    const metrics = [
        { label: 'Total Rides', value: 50, suffix: 'M+', decimals: 0 },
        { label: 'Active Partners', value: 10, suffix: 'K+', decimals: 0 },
        { label: 'User Rating', value: 4.9, suffix: '', decimals: 1 },
        { label: 'Global Cities', value: 500, suffix: '+', decimals: 0 },
    ]

    return (
        <footer className="bg-black text-white pt-20 pb-10 px-8">
            <div className="max-w-7xl mx-auto">
                {/* Brand & Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
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
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-40 text-white">Company</h4>
                        <ul className="space-y-4 text-sm font-medium text-white/70">
                            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                        </ul>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-40 text-white">Product</h4>
                        <ul className="space-y-4 text-sm font-medium text-white/70">
                            <li><a href="#" className="hover:text-white transition-colors">How it works</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Services</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
                        </ul>
                    </div>

                    {/* Contact & Socials */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-40 text-white">Contact</h4>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors cursor-pointer">
                                <Mail className="w-4 h-4" /> <span>support@goride.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors cursor-pointer">
                                <Phone className="w-4 h-4" /> <span>+91 9876543210</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors cursor-pointer">
                                <Globe className="w-4 h-4" /> <span>Worldwide</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Animated Metrics Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-t border-white/5 mb-16">
                    {metrics.map((stat, i) => (
                        <motion.div 
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center md:text-left"
                        >
                            <h3 className="text-3xl md:text-5xl font-black mb-2 tracking-tighter">
                                <CountUp value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                            </h3>
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Bottom */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
                    <p className="text-xs text-white/30 font-medium tracking-tight">
                        © 2024 GoRide Inc. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-[10px] uppercase font-bold tracking-widest text-white/30">
                        <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer