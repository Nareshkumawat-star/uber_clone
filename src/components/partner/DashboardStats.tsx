'use client'
import React from 'react'
import { Landmark, Car } from 'lucide-react'

interface DashboardStatsProps {
    stats: { label: string, value: string, icon: any, color: string, bg: string }[];
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {stats.map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 flex items-center justify-between group hover:bg-white/10 transition-all cursor-default">
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-4xl font-black tracking-tight text-white">{stat.value}</h3>
                    </div>
                    <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <stat.icon size={28} />
                    </div>
                </div>
            ))}
        </div>
    );
}
