'use client'
import React from 'react'
import { motion } from 'motion/react'
import { LayoutDashboard, Car, FileText, Landmark, Settings, LogOut, ChevronRight, Bell, User, MapPin, Navigation, Map } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function PartnerDashboard() {
  const stats = [
    { label: 'Total Earnings', value: '₹0.00', icon: Landmark, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: "Today's Rides", value: '0', icon: Car, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Rating', value: '5.0', icon: User, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex select-none font-sans selection:bg-purple-500/30">
      {/* Sidebar background gradient blob */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Sidebar */}
      <div className="w-20 md:w-24 lg:w-64 border-r border-white/10 flex flex-col items-center py-8 relative z-10 bg-black/40 backdrop-blur-3xl">
        <h1 className="text-2xl font-black tracking-tighter mb-12 hidden lg:block bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
          GoRide<span className="text-purple-500">.</span>
        </h1>
        <div className="lg:hidden w-10 h-10 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-xl mb-12 shadow-lg shadow-purple-500/20" />
        
        <div className="flex-1 w-full px-4 space-y-4">
          <NavItem icon={LayoutDashboard} label="Dashboard" active />
          <NavItem icon={Car} label="My Rides" />
          <NavItem icon={FileText} label="Documents" />
          <NavItem icon={Settings} label="Settings" />
        </div>

        <button 
          onClick={() => signOut()}
          className="mt-auto w-full px-4 group"
        >
          <div className="w-full flex items-center gap-4 p-4 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all">
            <LogOut size={20} />
            <span className="font-semibold hidden lg:block tracking-wide text-sm">Sign Out</span>
          </div>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto relative z-10">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl md:text-4xl font-black tracking-tight"
            >
              Overview
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mt-2 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Status: Live & Online
            </motion.p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-white/10 hover:text-white transition-all">
              <Bell size={20} />
            </div>
            <div className="h-12 pl-2 pr-5 bg-white/5 border border-white/10 rounded-full flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[1px]">
                  <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 hidden sm:block">My Profile</span>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[160px]">
          
          {/* Main Hero Card (Span large) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-6 lg:col-span-8 row-span-2 bg-gradient-to-br from-purple-900/40 to-black/40 border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group flex flex-col justify-end"
          >
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[80px] group-hover:bg-purple-500/30 transition-all duration-700" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-6">
                <Navigation className="text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" size={24} />
              </div>
              <h3 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter shadow-black drop-shadow-xl">Ready to drive?</h3>
              <p className="text-gray-400 text-sm md:text-base font-medium max-w-sm mb-8 leading-relaxed">
                Your account is fully approved! You are online and ready to accept nearby ride requests. Drive safely.
              </p>
              
              <div className="flex gap-4">
                <button className="bg-white text-black px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  Go Offline
                </button>
                <button className="bg-white/10 text-white border border-white/20 px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-white/20 transition-all">
                  Open Map <Map size={14} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Mini Cards */}
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="col-span-1 md:col-span-3 lg:col-span-4 row-span-1 bg-white/5 border border-white/5 hover:border-white/10 rounded-[2rem] p-6 flex flex-col justify-between group transition-all"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                  <ChevronRight size={14} className="text-gray-400" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black tracking-tight">{stat.value}</h3>
              </div>
            </motion.div>
          ))}

          {/* Extra Bento Card for Location / Map snippet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="md:col-span-6 lg:col-span-4 row-span-1 bg-white/5 border border-white/5 rounded-[2rem] p-6 relative overflow-hidden flex items-end"
          >
            <div className="absolute inset-0 bg-[url('https://maps.gstatic.com/mapfiles/api-3/images/map_dark.png')] opacity-30 bg-cover bg-center grayscale contrast-150" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
            
            <div className="relative z-10 w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Zone</p>
                  <p className="text-sm font-bold">Downtown Sector</p>
                </div>
              </div>
              <div className="text-[10px] bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20 font-bold uppercase tracking-wider">
                High Demand
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function NavItem({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={`w-full flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 group ${
      active 
        ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' 
        : 'hover:bg-white/5 text-gray-500 hover:text-white border border-transparent'
    }`}>
      <Icon size={20} className={`transition-transform duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'group-hover:scale-110'}`} />
      <span className={`font-semibold hidden lg:block tracking-wide text-sm ${active ? 'text-white' : ''}`}>
        {label}
      </span>
    </div>
  )
}
