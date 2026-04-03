'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { User, Clock, Star, ShieldCheck } from 'lucide-react'

const vehicles = [
  {
    id: 'luxury-sedan',
    name: 'GoRide Black',
    description: 'Premier luxury for discerning travelers.',
    price: '$12.00',
    capacity: 4,
    wait: '2 min',
    image: '/car_sedan.png',
  },
  {
    id: 'premium-suv',
    name: 'GoRide SUV',
    description: 'Spacious high-end SUVs for groups.',
    price: '$22.50',
    capacity: 6,
    wait: '5 min',
    image: '/car_suv.png',
  },
  {
    id: 'electric-car',
    name: 'GoRide Green',
    description: 'Eco-friendly premium electric travel.',
    price: '$14.00',
    capacity: 4,
    wait: '3 min',
    image: '/car_electric.png',
  },
  {
    id: 'luxury-van',
    name: 'GoRide Van',
    description: 'Luxury group travel with ample space.',
    price: '$35.00',
    capacity: 8,
    wait: '8 min',
    image: '/car_van.png',
  }
]

function Vechile_slider() {
  const [selected, setSelected] = useState(vehicles[0].id)

  return (
    <div className="bg-black text-white py-24 px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-16 flex justify-between items-end"
        >
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Choose Your Ride</h2>
            <div className="h-1 w-20 bg-white" />
          </div>
          <div className="hidden md:flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" /> Top-rated drivers only
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.map((vehicle) => (
            <motion.div
              key={vehicle.id}
              whileHover={{ y: -5 }}
              onClick={() => setSelected(vehicle.id)}
              className={`relative cursor-pointer p-8 rounded-none border transition-all duration-500 flex flex-col justify-between min-h-[400px] ${
                selected === vehicle.id 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold tracking-tight max-w-[120px] leading-tight">{vehicle.name}</h3>
                  <div className="text-xl font-black tracking-tighter">{vehicle.price}</div>
                </div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                  {vehicle.description}
                </p>
              </div>

              <div className="relative h-40 my-8 flex items-center justify-center">
                <motion.img 
                  src={vehicle.image} 
                  alt={vehicle.name}
                  className="w-full h-full object-contain filter brightness-110 contrast-125 transition-all"
                  animate={{ 
                    scale: selected === vehicle.id ? 1.15 : 1,
                    opacity: selected === vehicle.id ? 1 : 0.4,
                    filter: selected === vehicle.id ? 'grayscale(0%)' : 'grayscale(100%)'
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {vehicle.capacity}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {vehicle.wait}</span>
                </div>
                <div className="text-white/60">
                   <Star className="w-3 h-3 fill-white inline mr-1" /> 4.9
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Vechile_slider