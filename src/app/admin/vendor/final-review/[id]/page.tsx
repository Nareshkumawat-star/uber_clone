'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { Car, Landmark, FileText, CheckCircle, X, Eye, IndianRupee, Clock, Zap } from 'lucide-react'

function FinalReviewPage() {
    const params = useParams()
    const router = useRouter()
    const id = params?.id
    
    const [isLoading, setIsLoading] = useState(true)
    const [partnerData, setPartnerData] = useState<any>(null)
    const [isUpdating, setIsUpdating] = useState(false)
    const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [rejectReason, setRejectReason] = useState('')

    useEffect(() => {
        const handlegetpartner = async () => {
            if (!id) return;
            
            try {
                setIsLoading(true);
                // Reusing existing partner detail API
                const res = await axios.get(`/api/admin/reviews/partner/${id}`);
                setPartnerData(res.data);
            } catch (error) {
                console.error("Failed to fetch partner details:", error);
            } finally {
                setIsLoading(false);
            }
        }

        handlegetpartner();
    }, [id]);

    const handleAction = async (action: 'approve' | 'reject', reason?: string) => {
        try {
            setIsUpdating(true);
            await axios.patch('/api/admin/reviews/final', {
                partnerId: id,
                action: action,
                reason: reason || undefined
            });
            alert(`Partner ${action === 'approve' ? 'is now Live!' : 'rejected'}`);
            setShowRejectDialog(false);
            router.push('/');
        } catch (error) {
            console.error(`Failed to ${action} partner:`, error);
            alert(`Failed to ${action} partner`);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-bold uppercase tracking-widest text-xs">Loading final details...</div>
    }

    if (!partnerData) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 font-bold">Failed to load partner details.</div>
    }

    const { vechile, bank, document } = partnerData;

    return (
        <>
        {/* Simple Image Blur Modal */}
        {previewImage && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-8" onClick={() => setPreviewImage(null)}>
                <img src={previewImage.url} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-all duration-500 scale-100" />
                <button className="absolute top-10 right-10 text-white hover:rotate-90 transition-all"><X size={32} /></button>
            </div>
        )}

        <div className="min-h-screen bg-[#F8F9FB] p-8 md:p-12 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Final Approval Bridge</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-black tracking-tight leading-none mb-4">{partnerData.name}</h1>
                        <p className="text-gray-400 font-medium text-sm md:text-base">{partnerData.email} • {partnerData.mobileNumber}</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <button 
                            onClick={() => handleAction('approve')}
                            disabled={isUpdating}
                            className="w-full sm:w-auto px-10 py-5 bg-black text-white rounded-[1.5rem] font-black text-sm shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                        >
                            <Zap size={20} className="text-yellow-400 fill-yellow-400 group-hover:scale-110 transition-transform" />
                            {isUpdating ? 'Going Live...' : 'Approve & Go Live'}
                        </button>
                        <button 
                            onClick={() => setShowRejectDialog(true)}
                            className="w-full sm:w-auto px-10 py-5 bg-white text-red-600 border-2 border-red-50 rounded-[1.5rem] font-black text-sm hover:bg-red-50 transition-all active:scale-95"
                        >
                            Reject
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Feature: Vehicle & Pricing */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Vehicle Image Feature */}
                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 overflow-hidden relative">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-black">
                                        <Car size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-black">Vehicle Verification</h3>
                                </div>
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Main Asset</span>
                            </div>

                            <div 
                                className="relative aspect-video rounded-3xl overflow-hidden cursor-pointer group mb-8"
                                onClick={() => vechile?.imageurl && setPreviewImage({ url: vechile.imageurl, title: 'Vehicle Image' })}
                            >
                                {vechile?.imageurl ? (
                                    <>
                                        <img src={vechile.imageurl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Vehicle" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="bg-white px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-xl">
                                                <Eye size={16} /> Inspect Image
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300 font-bold italic">No image provided</div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Vehicle Type</p>
                                    <p className="font-black text-black">{vechile?.vechileType || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Plate Number</p>
                                    <p className="font-black text-black underline decoration-2 decoration-blue-100 underline-offset-4">{vechile?.number || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Model</p>
                                    <p className="font-black text-black">{vechile?.vechileModel || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Pricing Dashboard */}
                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                                    <IndianRupee size={20} />
                                </div>
                                <h3 className="text-xl font-black text-black">Service Pricing</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="relative p-8 rounded-3xl bg-black text-white shadow-2xl shadow-black/20">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Base Rate</p>
                                    <div className="flex items-end gap-1">
                                        <span className="text-4xl font-black">₹{vechile?.basfare || 0}</span>
                                        <span className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Fixed</span>
                                    </div>
                                </div>
                                <div className="p-8 rounded-3xl bg-gray-50/50 border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Per KM Rate</p>
                                    <div className="flex items-end gap-1">
                                        <span className="text-3xl font-black text-black">₹{vechile?.priceperkm || 0}</span>
                                        <span className="text-[10px] font-bold text-gray-400 mb-1 uppercase">/ KM</span>
                                    </div>
                                </div>
                                <div className="p-8 rounded-3xl bg-gray-50/50 border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Wait Charge</p>
                                    <div className="flex items-end gap-1">
                                        <span className="text-3xl font-black text-black">₹{vechile?.waitingcharge || 0}</span>
                                        <span className="text-[10px] font-bold text-gray-400 mb-1 uppercase">/ Min</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Secondary Info */}
                    <div className="space-y-8">
                        {/* Bank Card */}
                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Landmark size={20} />
                                </div>
                                <h3 className="text-xl font-black text-black">Settlement</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Holder Name</p>
                                    <p className="font-black text-black text-lg">{bank?.accountholder || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bank Account</p>
                                    <p className="font-bold text-gray-800 tracking-wider">•••• •••• {bank?.accountnumber?.slice(-4) || 'XXXX'}</p>
                                </div>
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">IFSC Code</p>
                                        <p className="font-black text-black">{bank?.ifsc || 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">UPI Handle</p>
                                        <p className="font-black text-black">{bank?.upi || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Documents Checklist Overlay */}
                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                    <FileText size={20} />
                                </div>
                                <h3 className="text-xl font-black text-black">Documents</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { title: 'Aadhaar Card', url: document?.aadharUrl },
                                    { title: 'Driving License', url: document?.licenceurl },
                                    { title: 'Vehicle RC', url: document?.rcurl },
                                ].map((doc, i) => (
                                    <div 
                                        key={i}
                                        onClick={() => doc.url && setPreviewImage({ url: doc.url, title: doc.title })}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-black/10 cursor-pointer transition-all"
                                    >
                                        <span className="text-xs font-bold text-gray-600">{doc.title}</span>
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black shadow-sm">
                                            <Eye size={14} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Final Check Reminder */}
                        <div className="p-8 rounded-[2.5rem] bg-amber-500 text-white shadow-2xl shadow-amber-500/20">
                            <div className="flex items-center gap-2 mb-2 font-black uppercase tracking-widest text-[10px]">
                                <Clock size={12} /> Verification Alert
                            </div>
                            <p className="text-sm font-bold leading-relaxed">Ensure all details match physical documents before clicking "Live". Once approved, the partner can begin accepting rides immediately.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Reject Dialog */}
        {showRejectDialog && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4" onClick={() => setShowRejectDialog(false)}>
                <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-2xl font-black text-black mb-2">Issue Rejection</h3>
                    <p className="text-sm text-gray-400 font-medium mb-8">Explain what needs correction. The partner will be sent back to the setup phase.</p>
                    <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. Vehicle image is not clear or Pricing is unrealistic..."
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-3xl p-5 text-sm font-medium outline-none transition-all resize-none h-32 mb-8 text-black"
                    />
                    <div className="flex gap-4">
                        <button onClick={() => setShowRejectDialog(false)} className="flex-1 py-4 border-2 border-gray-100 rounded-2xl text-sm font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all">Cancel</button>
                        <button onClick={() => handleAction('reject', rejectReason)} disabled={isUpdating} className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-500/20">{isUpdating ? '...' : 'Confirm'}</button>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}

export default FinalReviewPage
