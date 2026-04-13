'use client'
import React from 'react'
import { motion } from 'motion/react'
import { Landmark, TrendingUp, ArrowUpRight, ArrowDownLeft, Wallet, Calendar } from 'lucide-react'

export default function EarningsSection() {
  const transactions: any[] = []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Balance Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-gradient-to-br from-purple-600 to-blue-700 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-purple-500/20"
        >
          <div className="absolute top-0 right-0 p-12 opacity-10 drop-shadow-2xl">
            <Landmark size={200} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Available Balance</span>
            </div>
            
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter mb-4">₹0<span className="text-white/40">.00</span></h2>
            
            <div className="flex gap-4 mt-12">
              <button className="bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10">
                Withdraw Now
              </button>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all">
                History
              </button>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between h-full">
                <div>
                    <div className="w-12 h-12 bg-gray-500/10 border border-gray-500/20 rounded-2xl flex items-center justify-center mb-6">
                        <TrendingUp className="text-gray-400" size={24} />
                    </div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Weekly Growth</p>
                    <h3 className="text-3xl font-black text-white">0%</h3>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5">
                    <p className="text-xs font-medium text-gray-400 leading-relaxed">
                        Complete your <span className="text-white font-bold">first ride</span> to see your growth insights.
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Rides', value: '0', icon: Calendar },
          { label: 'Completed', value: '0', icon: Calendar },
          { label: 'Cancelled', value: '0', icon: Calendar },
          { label: 'Rating', value: '5.0', icon: Calendar },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-xl font-black text-white">{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white/5 border border-white/5 rounded-[3rem] p-8 md:p-12">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-2xl font-black text-white tracking-tight">Recent Transactions</h3>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-500">
            <Wallet size={32} />
          </div>
          <div>
            <h4 className="font-bold text-white text-lg">No transactions yet</h4>
            <p className="text-sm text-gray-500 font-medium">Your ride earnings and payouts will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
