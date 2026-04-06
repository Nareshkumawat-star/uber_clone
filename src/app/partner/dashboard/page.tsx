'use client'
import React from 'react'
import { motion } from 'motion/react'
import { LayoutDashboard, Car, FileText, Landmark, Settings, LogOut, ChevronRight, Bell, User } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function PartnerDashboard() {
  const stats = [
    { label: 'Total Earnings', value: '$0.00', icon: Landmark },
    { label: 'Today\'s Rides', value: '0', icon: Car },
    { label: 'Rating', value: '5.0', icon: User },
  ]

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex">
      {/* Sidebar */}
      <div className="w-20 md:w-64 bg-white border-r border-gray-100 flex flex-col items-center py-10 transition-all">
        <h1 className="text-xl font-black text-black tracking-tighter mb-12 hidden md:block">
          Go<span className="opacity-20">Ride</span>
        </h1>
        
        <div className="flex-1 space-y-8">
          <div className="p-3 bg-black text-white rounded-2xl shadow-lg cursor-pointer">
            <LayoutDashboard size={20} />
          </div>
          <div className="p-3 text-gray-400 hover:text-black transition-colors cursor-pointer">
            <Car size={20} />
          </div>
          <div className="p-3 text-gray-400 hover:text-black transition-colors cursor-pointer">
            <FileText size={20} />
          </div>
          <div className="p-3 text-gray-400 hover:text-black transition-colors cursor-pointer">
            <Settings size={20} />
          </div>
        </div>

        <button 
          onClick={() => signOut()}
          className="mt-auto p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-all cursor-pointer"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-2xl font-black text-black tracking-tight">Partner Dashboard</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">status: pending verification</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50">
              <Bell size={18} />
            </div>
            <div className="h-10 px-4 bg-white border border-gray-100 rounded-full flex items-center gap-3 cursor-pointer hover:bg-gray-50">
              <div className="w-6 h-6 rounded-full bg-black/5" />
              <span className="text-[10px] font-black uppercase tracking-widest">My Account</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm"
            >
              <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center text-black mb-4">
                <stat.icon size={18} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-black">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black text-white p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group"
        >
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-4 tracking-tighter">Your application is under review.</h3>
            <p className="text-gray-400 text-sm max-w-md font-medium leading-relaxed">
              We're currently verifying your documents and bank details. This usually takes 24-48 hours. We'll notify you via email once you're ready to hit the road!
            </p>
            <button className="mt-8 bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:scale-105 transition-all">
              Check Status
              <ChevronRight size={14} />
            </button>
          </div>
          
          {/* Abstract decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/10 transition-all" />
        </motion.div>
      </div>
    </div>
  )
}
