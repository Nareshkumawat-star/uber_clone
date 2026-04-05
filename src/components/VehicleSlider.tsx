'use client'
import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bike, Car, ChevronLeft, ChevronRight, Truck, Zap, Users, Package, Star } from 'lucide-react'

const categories = [
  {
    id: 1,
    badge: '# QUICK',
    name: 'Bikes',
    desc: 'Fast & affordable rides',
    icon: Bike,
  },
  {
    id: 2,
    badge: '# COMFORT',
    name: 'Cars',
    desc: 'Comfortable city travel',
    icon: Car,
  },
  {
    id: 3,
    badge: '# PREMIUM',
    name: 'SUVs',
    desc: 'Premium & spacious',
    icon: Zap,
  },
  {
    id: 4,
    badge: '# FAMILY',
    name: 'Vans',
    desc: 'Family & group transport',
    icon: Users,
  },
  {
    id: 5,
    badge: '# ELITE',
    name: 'Luxury',
    desc: 'Travel in ultimate style',
    icon: Star,
  },
  {
    id: 6,
    badge: '# GO',
    name: 'Courier',
    desc: 'Fast & secure parcels',
    icon: Package,
  }
]

function Vechile_slider() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const currentRef = scrollRef.current
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
      return () => {
        currentRef.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 300 : 340
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className='bg-white py-20 md:py-24 px-4 md:px-16 overflow-hidden'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex flex-col md:flex-row md:items-end md:justify-between mb-12 md:mb-16'>
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className='text-4xl md:text-5xl font-black tracking-tighter text-black mb-3'
            >
              Vehicles<br className='hidden md:block' /> <span className='md:hidden'>—</span> Categories
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className='text-gray-400 font-medium text-sm md:text-base'
            >
              Choose the ride that fits your journey
            </motion.p>
          </div>
        </div>

        {/* Slider Container Wrapper */}
        <div className='relative group/slider'>
          {/* Navigation Buttons - Absolute Positioned */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => scroll('left')}
                className='absolute left-2 md:-left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-center text-black z-30 shadow-xl md:opacity-0 group-hover/slider:opacity-100 transition-all duration-300'
              >
                <ChevronLeft size={24} />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {canScrollRight && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => scroll('right')}
                className='absolute right-2 md:-right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-center text-black z-30 shadow-xl md:opacity-0 group-hover/slider:opacity-100 transition-all duration-300'
              >
                <ChevronRight size={24} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Edge Gradients for Desktop */}
          <div className='hidden md:block absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none' />
          <div className='hidden md:block absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none' />

          {/* Slider */}
          <div
            ref={scrollRef}
            className='flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-8 scroll-smooth snap-x'
          >
            {categories.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className='min-w-[260px] md:min-w-[320px] bg-white border border-gray-100 p-6 md:p-8 rounded-[2rem] hover:shadow-2xl hover:shadow-black/5 transition-all group snap-start cursor-pointer'
              >
                <div className='flex flex-col items-start gap-6 md:gap-8'>
                  {/* Badge */}
                  <span className='bg-gray-50 text-[10px] font-black text-gray-400 px-3 py-1.5 rounded-full uppercase tracking-widest group-hover:bg-black group-hover:text-white transition-colors'>
                    {item.badge}
                  </span>

                  {/* Icon Holder */}
                  <div className='w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-3xl flex items-center justify-center group-hover:bg-black group-hover:rotate-6 transition-all duration-500'>
                    <item.icon size={24} strokeWidth={1.5} className='text-black group-hover:text-white md:hidden' />
                    <item.icon size={32} strokeWidth={1.5} className='text-black group-hover:text-white hidden md:block' />
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className='text-xl md:text-2xl font-bold text-black mb-1'>{item.name}</h3>
                    <p className='text-xs md:text-sm text-gray-400 font-medium'>{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
    </section>
  )
}

export default Vechile_slider