'use client'
import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { IndianRupee, Loader2, ImagePlus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { setUser } from '@/redux/userSlice'
import axios from 'axios'

export default function PriceModel() {
    const [formData, setFormData] = useState({
        basfare: '',
        priceperkm: '',
        waitingcharge: '',
    })
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const dispatch = useDispatch()

    useEffect(() => {
        const fetchCurrentPricing = async () => {
            try {
                const res = await axios.get('/api/partner/onboard/vechile')
                if (res.data?.vechile) {
                    setFormData({
                        basfare: res.data.vechile.basfare?.toString() || '',
                        priceperkm: res.data.vechile.priceperkm?.toString() || '',
                        waitingcharge: res.data.vechile.waitingcharge?.toString() || '',
                    })
                    if (res.data.vechile.imageurl) {
                        setImagePreview(res.data.vechile.imageurl)
                    }
                }
            } catch (err) {
                console.error("Failed to fetch pricing:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCurrentPricing()
    }, [])

    const handleInputChange = (field: string, value: string) => {
        const cleaned = value.replace(/[^0-9.]/g, '')
        setFormData(prev => ({ ...prev, [field]: cleaned }))
        if (error) setError(null)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const isFormValid = formData.basfare && formData.priceperkm && formData.waitingcharge

    const handleSubmit = async () => {
        if (!isFormValid || isSubmitting) return
        
        setIsSubmitting(true)
        setError(null)

        try {
            const data = new FormData()
            data.append('basfare', formData.basfare)
            data.append('priceperkm', formData.priceperkm)
            data.append('waitingcharge', formData.waitingcharge)
            if (image) {
                data.append('vehicleImage', image)
            }

            const res = await axios.post('/api/partner/onboard/pricing', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (res.data.user) {
                dispatch(setUser(res.data.user))
            }

            router.replace('/')
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to save pricing details.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-black mb-4" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading details...</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 font-sans">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100">
                <h1 className="text-xl font-bold text-black tracking-tight">
                    Pricing and Vehicle Image
                </h1>
            </div>

            <div className="p-8 space-y-8">
                {/* Vehicle Image Upload */}
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-full aspect-[2/1] rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/30 hover:bg-gray-50 transition-all cursor-pointer flex flex-col items-center justify-center group overflow-hidden"
                >
                    {imagePreview ? (
                        <>
                            <img src={imagePreview} className="w-full h-full object-cover" alt="Vehicle preview" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <p className="text-white text-xs font-bold uppercase tracking-wider bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">Change Image</p>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <ImagePlus size={40} className="text-gray-300 group-hover:text-black transition-colors" strokeWidth={1.5} />
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden" 
                        accept="image/*"
                    />
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { id: 'basfare', label: 'Base Fare', placeholder: 'base fare' },
                        { id: 'priceperkm', label: 'Price Per KM', placeholder: 'price per KM' },
                        { id: 'waitingcharge', label: 'Waiting Charge', placeholder: 'Waiting Charge' },
                    ].map((field) => (
                        <div key={field.id} className="space-y-2">
                            <label className="text-sm font-bold text-black">
                                {field.label}
                            </label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-black">
                                    <IndianRupee size={16} strokeWidth={2.5} />
                                </div>
                                <input 
                                    type="text" 
                                    value={formData[field.id as keyof typeof formData]}
                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="w-full bg-white border border-gray-300 focus:border-black rounded-2xl py-4 pl-12 pr-6 text-sm font-medium transition-all outline-none text-black placeholder:text-gray-300"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
                        <p className="text-xs font-bold text-red-600 uppercase tracking-wider">
                            {error}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer Buttons */}
            <div className="px-8 py-6 bg-white border-t border-gray-100 flex flex-col md:flex-row gap-4">
                <button
                    onClick={() => router.push('/')}
                    className="flex-1 py-4 border border-gray-200 rounded-2xl text-sm font-bold text-black hover:bg-gray-50 transition-all active:scale-95"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!isFormValid || isSubmitting}
                    className={`
                        flex-1 py-4 rounded-2xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2
                        ${isFormValid && !isSubmitting 
                            ? 'bg-black text-white hover:bg-gray-800' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            Saving...
                        </>
                    ) : 'Save'}
                </button>
            </div>
        </div>
    )
}