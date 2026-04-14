'use client'
import React, { useEffect, useRef } from 'react'
import { motion, useInView, useSpring, useTransform } from 'motion/react'
import { Globe, Mail, Phone, Timer } from 'lucide-react'

function CountUp({ value, suffix = '', decimals = 0 }: { value: number, suffix?: string, decimals?: number }) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: "-50px" })
    const spring = useSpring(0, { stiffness: 40, damping: 20 })
    const displayValue = useTransform(spring, (latest) => 
        latest.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    )
    useEffect(() => { if (inView) spring.set(value) }, [inView, value, spring])
    return (
        <span ref={ref}>
            <motion.span>{displayValue}</motion.span>{suffix}
        </span>
    )
}

function Footer() {
    const metrics = [
        { label: 'Total Rides', value: 50, suffix: 'M+', decimals: 0 },
        { label: 'Partners', value: 10, suffix: 'K+', decimals: 0 },
        { label: 'Rating', value: 4.9, suffix: '', decimals: 1 },
        { label: 'Cities', value: 500, suffix: '+', decimals: 0 },
    ]

    return (
        <footer className="bg-white text-black pt-24 pb-12 px-6 border-t border-gray-100">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                <Timer className="text-white w-4 h-4" />
                            </div>
                            <h1 className="text-lg font-black tracking-tighter uppercase">GoRide</h1>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs uppercase font-bold tracking-tight">
                            The next generation of urban mobility. Reliable, fast, and secure.
                        </p>
                    </div>

                    {['Company', 'Product', 'Legal'].map((title, i) => (
                        <div key={i}>
                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 text-gray-400">{title}</h4>
                            <ul className="space-y-3 text-xs font-black uppercase tracking-wider text-black">
                                <li><a href="#" className="hover:opacity-50 transition-opacity">About Us</a></li>
                                <li><a href="#" className="hover:opacity-50 transition-opacity">Services</a></li>
                                <li><a href="#" className="hover:opacity-50 transition-opacity">Privacy</a></li>
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-y border-gray-50 mb-12">
                    {metrics.map((stat, i) => (
                        <div key={i} className="text-center md:text-left">
                            <h3 className="text-3xl md:text-5xl font-black tracking-tighter mb-1">
                                <CountUp value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                            </h3>
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-widest text-gray-300">
                    <p>© 2024 GoRide Inc.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-black transition-colors">Instagram</a>
                        <a href="#" className="hover:text-black transition-colors">Twitter</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer