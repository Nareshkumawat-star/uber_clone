'use client'
import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bike, Car, ChevronLeft, ChevronRight, Zap, Users, Package, Star, ArrowRight } from 'lucide-react'

const categories = [
  { id: 1, badge: 'Quick', name: 'Bikes', desc: 'Fast local transit', icon: Bike },
  { id: 2, badge: 'Standard', name: 'Cars', desc: 'Secure city travel', icon: Car },
  { id: 3, badge: 'Elite', name: 'Premium', desc: 'High-end experience', icon: Star },
  { id: 4, badge: 'Group', name: 'SUVs', desc: 'For family & friends', icon: Users },
  { id: 5, badge: 'Cargo', name: 'Delivery', desc: 'Move anything now', icon: Package },
]

function Vechile_slider() {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className='bg-white py-20 px-6 md:px-16 overflow-hidden border-t border-gray-50 text-black'>
      <div className='max-w-7xl mx-auto'>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
             <div>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Categories</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">Tailored for every occasion</p>
             </div>
             <div className="flex gap-2">
                 <button onClick={() => scroll('left')} className="w-12 h-12 rounded-xl border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all"><ChevronLeft size={20} /></button>
                 <button onClick={() => scroll('right')} className="w-12 h-12 rounded-xl border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all"><ChevronRight size={20} /></button>
             </div>
        </div>

        <div
          ref={scrollRef}
          className='flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-10'
        >
          {categories.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -5 }}
              className='min-w-[280px] md:min-w-[320px] bg-white border border-gray-100 p-8 rounded-2xl transition-all group cursor-pointer'
            >
              <div className="flex flex-col gap-8">
                 <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 group-hover:text-black">{item.badge}</span>
                    <item.icon size={24} className="text-gray-300 group-hover:text-black transition-colors" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">{item.name}</h3>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">{item.desc}</p>
                 </div>
                 <div className="pt-4 flex items-center gap-2 group-hover:gap-4 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Explore</span>
                    <ArrowRight size={14} />
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Vechile_slider