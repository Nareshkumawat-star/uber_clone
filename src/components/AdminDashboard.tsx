'use client'
import React, { useState } from 'react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { 
    Users, 
    CheckCircle2, 
    Clock, 
    XCircle,
    Video,
    Car,
    ShieldCheck,
    Search,
    Bell
} from 'lucide-react'

// Updated stats based on image
import axios from 'axios'

// Updated stats based on image
const STAT_CONFIG = [
    { id: 1, label: "TOTAL PARTNERS", key: 'total', icon: Users, bgColor: "bg-purple-50", iconColor: "text-purple-600" },
    { id: 2, label: "APPROVED PARTNERS", key: 'approved', icon: CheckCircle2, bgColor: "bg-blue-50", iconColor: "text-blue-600" },
    { id: 3, label: "PENDING PARTNERS", key: 'pending', icon: Clock, bgColor: "bg-orange-50", iconColor: "text-orange-900" },
    { id: 4, label: "REJECTED PARTNERS", key: 'rejected', icon: XCircle, bgColor: "bg-red-50", iconColor: "text-red-600" },
];

const TABS = [
    { id: 'partner', label: 'Pending Partner Reviews', icon: Users, badgeKey: 'pending', badgeType: 'error' },
    { id: 'kyc', label: 'Pending Video KYC', icon: Video, badgeKey: 'pendingKyc', badgeType: 'error' },
    { id: 'final', label: 'Final Review', icon: Car, badgeKey: 'pendingFinal', badgeType: 'neutral' },
];

function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('partner');
    const [partners, setPartners] = useState<any[]>([]);
    const [kycPartners, setKycPartners] = useState<any[]>([]);
    const [finalPartners, setFinalPartners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0, pendingKyc: 0, pendingFinal: 0 });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [partnerRes, kycRes, finalRes] = await Promise.all([
                axios.get('/api/admin/partners'),
                axios.get('/api/admin/videokyc/pending'),
                axios.get('/api/admin/reviews/final')
            ]);
            const partnerData = partnerRes.data.partners;
            const kycData = kycRes.data.partners;
            const finalData = finalRes.data.partners;

            setPartners(partnerData);
            setKycPartners(kycData);
            setFinalPartners(finalData);
            
            setStats({
                total: partnerData.length + kycData.length + finalData.length,
                approved: 0,
                pending: partnerData.length,
                rejected: 0,
                pendingKyc: kycData.length,
                pendingFinal: finalData.length
            });
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (partnerId: string, action: 'approve' | 'reject') => {
        try {
            await axios.patch('/api/admin/partners', { partnerId, action });
            fetchData();
        } catch (error) {
            console.error(`Failed to ${action} partner:`, error);
        }
    };

    const handleKycAction = async (partnerId: string, action: 'approve' | 'reject') => {
        try {
            await axios.patch('/api/admin/videokyc/pending', { partnerId, action });
            fetchData();
        } catch (error) {
            console.error(`Failed to ${action} KYC:`, error);
        }
    };

    return (
        <div className="flex h-screen bg-[#f1f3f6]">
            {/* Sidebar (Optional, but kept for structure) */}
            <aside className="w-20 lg:w-64 bg-white border-r border-gray-200 flex flex-col transition-all">
                <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                    <ShieldCheck className="w-8 h-8 text-black" />
                    <span className="hidden lg:block font-bold text-xl tracking-tight">GoRide Admin</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <div className="px-2 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden lg:block">Main Menu</div>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-black text-white shadow-lg">
                        <Users className="w-5 h-5" />
                        <span className="hidden lg:block font-semibold">Partners</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-black transition-colors w-64 bg-white" />
                        </div>
                        <button className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                            <Bell className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Stat Cards - Matching Image */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                    {STAT_CONFIG.map((conf) => (
                        <div key={conf.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[140px] md:min-h-[160px] flex flex-col justify-between hover:shadow-xl hover:border-black/5 transition-all cursor-default group">
                            <div className={`w-12 h-12 ${conf.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <conf.icon className={`w-6 h-6 ${conf.iconColor}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{conf.label}</p>
                                <h3 className="text-4xl font-extrabold text-black tracking-tight">{stats[conf.key as keyof typeof stats]}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Tabs - Responsive Scrollable */}
                <div className="bg-white rounded-[2rem] p-2 shadow-sm border border-gray-100 flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide">
                    {TABS.map((tab) => {
                        const badgeValue = tab.badgeKey ? stats[tab.badgeKey as keyof typeof stats] : tab.badgeValue;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 rounded-2xl transition-all duration-300 relative group whitespace-nowrap ${
                                    activeTab === tab.id 
                                        ? "bg-black text-white shadow-2xl shadow-black/20" 
                                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                }`}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
                                <span className="text-sm font-bold whitespace-nowrap">{tab.label}</span>
                                
                                {/* Badge */}
                                <span className={`flex items-center justify-center min-w-[20px] h-5 rounded-full text-[10px] font-bold px-1.5 ${
                                    tab.badgeType === 'error' && activeTab !== tab.id
                                        ? "bg-red-500 text-white"
                                        : activeTab === tab.id
                                            ? "bg-white text-black"
                                            : "bg-gray-200 text-gray-500"
                                }`}>
                                    {badgeValue}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-20">
                            <Clock className="w-8 h-8 animate-spin text-gray-300" />
                        </div>
                    ) : activeTab === 'partner' ? (
                        partners.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
                                <div className="max-w-md mx-auto">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Users className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h2 className="text-xl font-bold text-black mb-2">No Pending Reviews</h2>
                                    <p className="text-gray-400 text-sm">Everything is up to date! Check back later for new pending requests.</p>
                                </div>
                            </div>
                        ) : (
                            partners.map((partner) => (
                                <div key={partner._id} className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:shadow-xl hover:border-black/5 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-50 flex items-center justify-center text-xl font-bold border border-gray-100 shrink-0">
                                            {partner.name?.charAt(0)}
                                        </div>
                                        <div className="flex flex-col gap-1 overflow-hidden">
                                            <h4 className="font-black text-black text-lg md:text-xl leading-none truncate">{partner.name}</h4>
                                            <p className="text-xs text-gray-400 font-medium truncate">{partner.email}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="bg-gray-50 text-[10px] font-bold text-gray-500 px-2 py-1 rounded-md border border-gray-100 uppercase tracking-wider">
                                                    {partner.vehicle?.vechileType} • {partner.vehicle?.number}
                                                </span>
                                                <span className="bg-blue-50 text-[10px] font-bold text-blue-500 px-2 py-1 rounded-md border border-blue-100 uppercase tracking-wider">
                                                    Documents Pending
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => router.push(`/admin/vendor/reviews/${partner._id}`)}
                                            className="px-6 py-2.5 bg-black text-white rounded-xl text-xs font-bold shadow-lg hover:bg-gray-800 transition-all active:scale-95"
                                        >
                                            Review
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    ) : activeTab === 'kyc' ? (
                        kycPartners.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
                                <div className="max-w-md mx-auto">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Video className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h2 className="text-xl font-bold text-black mb-2">No Pending Video KYC</h2>
                                    <p className="text-gray-400 text-sm">No partners are waiting for video verification.</p>
                                </div>
                            </div>
                        ) : (
                            kycPartners.map((partner: any) => (
                                <div key={partner._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:border-black/10 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-xl font-bold border border-purple-100 text-purple-600">
                                            {partner.name?.charAt(0)}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h4 className="font-bold text-black text-lg leading-none">{partner.name}</h4>
                                            <p className="text-xs text-gray-400 font-medium">{partner.email}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="bg-yellow-50 text-[10px] font-bold text-yellow-600 px-2 py-1 rounded-md border border-yellow-100 uppercase tracking-wider">
                                                    Video KYC Pending
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => router.push(`/videokyc/${partner._id}`)}
                                            className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            <Video className="w-3.5 h-3.5" />
                                            Start KYC
                                        </button>
                                        <button 
                                            onClick={() => handleKycAction(partner._id, 'reject')}
                                            className="px-5 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-50 transition-all active:scale-95"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    ) : activeTab === 'final' ? (
                        finalPartners.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
                                <div className="max-w-md mx-auto">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Car className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h2 className="text-xl font-bold text-black mb-2">No Final Reviews</h2>
                                    <p className="text-gray-400 text-sm">No partners are waiting for final approval.</p>
                                </div>
                            </div>
                        ) : (
                            finalPartners.map((partner: any) => (
                                <div key={partner._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:border-black/10 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-xl font-bold border border-blue-100 text-blue-600 overflow-hidden">
                                            {partner.vehicle?.imageurl ? (
                                                <img src={partner.vehicle.imageurl} className="w-full h-full object-cover" />
                                            ) : (
                                                partner.name?.charAt(0)
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h4 className="font-bold text-black text-lg leading-none">{partner.name}</h4>
                                            <p className="text-xs text-gray-400 font-medium">{partner.email}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="bg-green-50 text-[10px] font-bold text-green-600 px-2 py-1 rounded-md border border-green-100 uppercase tracking-wider">
                                                    Pricing Configured
                                                </span>
                                                <span className="bg-gray-50 text-[10px] font-bold text-gray-400 px-2 py-1 rounded-md border border-gray-100 uppercase tracking-wider">
                                                    {partner.vehicle?.vechileType} • ₹{partner.vehicle?.basfare} Base
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => router.push(`/admin/vendor/final-review/${partner._id}`)}
                                            className="px-6 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            Complete Review
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    ) : null}
                </div>
            </main>
        </div>
    )
}

export default AdminDashboard