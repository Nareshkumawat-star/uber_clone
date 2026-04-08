'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { Car, Landmark, FileText, CheckCircle, X, ZoomIn, Eye } from 'lucide-react'

function ReviewPage() {
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
            await axios.patch('/api/admin/partners', {
                partnerId: id,
                action: action,
                reason: reason || undefined
            });
            alert(`Partner ${action}d successfully`);
            setShowRejectDialog(false);
            setRejectReason('');
            router.push('/');
        } catch (error) {
            console.error(`Failed to ${action} partner:`, error);
            alert(`Failed to ${action} partner`);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading details...</div>
    }

    if (!partnerData) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">Failed to load partner details.</div>
    }

    const { vechile, bank, document } = partnerData;

    const docCards = [
        { title: 'Aadhaar', url: document?.aadharUrl },
        { title: 'Registration Certificate', url: document?.rcurl },
        { title: 'Driving License', url: document?.licenceurl },
    ];

    return (
        <>
        {/* Image Preview Modal */}
        {previewImage && (
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setPreviewImage(null)}
            >
                <div
                    className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800">{previewImage.title}</h3>
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    {/* Modal Image */}
                    <div className="p-4 flex items-center justify-center bg-gray-50" style={{ maxHeight: 'calc(90vh - 70px)' }}>
                        <img
                            src={previewImage.url}
                            alt={previewImage.title}
                            className="max-w-full max-h-[75vh] object-contain rounded-lg"
                        />
                    </div>
                </div>
            </div>
        )}

        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Vehicle Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6 text-gray-800 font-semibold">
                            <Car size={20} />
                            <h3>Vehicle Details</h3>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-500">Vehicle Type</span>
                                <span className="font-medium text-gray-800">{vechile?.vechileType || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-500">Registration Number</span>
                                <span className="font-medium text-gray-800">{vechile?.number || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-500">Model</span>
                                <span className="font-medium text-gray-800">{vechile?.vechileModel || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6 text-gray-800 font-semibold">
                            <FileText size={20} />
                            <h3>Documents</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {docCards.map((doc) => (
                                <div key={doc.title} className="border border-gray-200 rounded-xl overflow-hidden flex flex-col group">
                                    <div className="bg-gray-50 py-2 px-3 text-sm font-medium text-gray-700 border-b border-gray-200">
                                        {doc.title}
                                    </div>
                                    <div
                                        className="relative h-48 bg-gray-100 flex-1 cursor-pointer overflow-hidden"
                                        onClick={() => doc.url && setPreviewImage({ url: doc.url, title: doc.title })}
                                    >
                                        {doc.url ? (
                                            <>
                                                <img
                                                    src={doc.url}
                                                    alt={doc.title}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                />
                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-1">
                                                        <Eye size={24} className="text-white drop-shadow-lg" />
                                                        <span className="text-white text-xs font-medium drop-shadow-lg">Click to preview</span>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Bank Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6 text-gray-800 font-semibold">
                            <Landmark size={20} />
                            <h3>Bank Details</h3>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500">Account Holder</span>
                                <span className="font-medium text-gray-800">{bank?.accountholder || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500">Account Number</span>
                                <span className="font-medium text-gray-800">{bank?.accountnumber || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500">IFSC Code</span>
                                <span className="font-medium text-gray-800">{bank?.ifsc || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-500">Upi</span>
                                <span className="font-medium text-gray-800">{bank?.upi || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Admin Check */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold">
                            <CheckCircle size={20} />
                            <h3>Admin Check</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Verify documents carefully before approving.</p>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => handleAction('approve')}
                                disabled={isUpdating}
                                className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                            >
                                {isUpdating ? 'Processing...' : 'Approve'}
                            </button>
                            <button 
                                onClick={() => setShowRejectDialog(true)}
                                disabled={isUpdating}
                                className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* Reject Dialog */}
        {showRejectDialog && (
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowRejectDialog(false)}
            >
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Reject Partner</h3>
                    <p className="text-sm text-gray-500 mb-4">Provide a reason for rejection (optional).</p>
                    <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. Documents are not clear..."
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-gray-400 transition-colors resize-none h-28 mb-4"
                    />
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setShowRejectDialog(false); setRejectReason(''); }}
                            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleAction('reject', rejectReason)}
                            disabled={isUpdating}
                            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:bg-red-300"
                        >
                            {isUpdating ? 'Rejecting...' : 'Reject'}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}

export default ReviewPage