'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, UploadCloud, CheckCircle2, ShieldCheck, FileText, CreditCard, Shield, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const documentSteps = [
  { id: 'id_proof', title: 'Aadhaar / ID Proof', subtitle: 'Government issued ID', icon: ShieldCheck, dbKey: 'aadharUrl' },
  { id: 'driving_license', title: 'Driving License', subtitle: 'Valid driving license', icon: CreditCard, dbKey: 'licenceurl' },
  { id: 'vehicle_rc', title: 'Vehicle RC', subtitle: 'Registration Certificate', icon: FileText, dbKey: 'rcurl' },
]

export default function DocumentsPage() {
  const [uploads, setUploads] = useState<Record<string, File | string | null>>({
    id_proof: null,
    driving_license: null,
    vehicle_rc: null,
  })
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await axios.get('/api/partner/onboard/document')
        if (res.status === 200 && res.data.docs) {
          const { aadharUrl, licenceurl, rcurl } = res.data.docs
          setUploads({
            id_proof: aadharUrl || null,
            driving_license: licenceurl || null,
            vehicle_rc: rcurl || null,
          })
        }
      } catch (err) {
        // No existing documents found is now a clean 200 null response, so this catch is only for real errors
        console.error('Error fetching documents:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDocs()
  }, [])

  const handleFileChange = (id: string, file: File | null) => {
    if (file) {
      setUploads(prev => ({ ...prev, [id]: file }))
    }
  }

  const triggerUpload = (id: string) => {
    document.getElementById(`file-input-${id}`)?.click()
  }

  const allUploaded = Object.values(uploads).every(v => v !== null)

  const handleContinue = async () => {
    if (allUploaded && !isUploading) {
      setIsUploading(true)
      try {
        const formData = new FormData()
        
        // Only append if it's a new File object
        if (uploads.id_proof instanceof File) formData.append('aadhar', uploads.id_proof)
        if (uploads.driving_license instanceof File) formData.append('license', uploads.driving_license)
        if (uploads.vehicle_rc instanceof File) formData.append('rc', uploads.vehicle_rc)

        // If no new files, just proceed
        const hasNewFiles = uploads.id_proof instanceof File || 
                           uploads.driving_license instanceof File || 
                           uploads.vehicle_rc instanceof File

        if (hasNewFiles) {
          const res = await axios.post('/api/partner/onboard/document', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          if (res.status === 200) {
            router.push('/partner/onboarding/Bank')
          }
        } else {
          router.push('/partner/onboarding/Bank')
        }
      } catch (error) {
        console.error('Upload failed:', error)
      } finally {
        setIsUploading(false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-black" size={40} />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Checking documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-2xl p-6 md:p-10 relative overflow-hidden">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <button 
            onClick={() => router.push('/partner/onboarding/vehicle')}
            className="absolute left-6 top-6 w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-black hover:bg-gray-50 transition-colors z-50 bg-white"
          >
            <ArrowLeft size={18} />
          </button>
          
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">
            step 2 of 3
          </span>
          <h1 className="text-3xl font-black text-black tracking-tight mb-1">
            Upload Documents
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            Required for verification
          </p>
        </div>

        {/* Document Cards */}
        <div className="space-y-4 mb-8">
          {documentSteps.map((doc, index) => {
            const uploadValue = uploads[doc.id]
            const isUploaded = !!uploadValue
            const isFile = uploadValue instanceof File
            const Icon = doc.icon

            let subtitle = doc.subtitle
            if (isFile) {
              subtitle = (uploadValue as File).name
            } else if (typeof uploadValue === 'string') {
              subtitle = "Document already uploaded"
            }

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative flex items-center justify-between p-6 rounded-2xl border transition-all duration-300
                  bg-white border-black/[0.05] hover:border-black/10
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm bg-gray-50 text-gray-400`}>
                    <Icon size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight text-black">
                      {doc.title}
                    </h3>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isFile || typeof uploadValue === 'string' ? 'text-green-500' : 'text-gray-400'}`}>
                      {subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <input
                    type="file"
                    id={`file-input-${doc.id}`}
                    className="hidden"
                    onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                  />
                  <button
                    onClick={() => triggerUpload(doc.id)}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md
                      ${isUploaded ? 'bg-green-500 text-white' : 'bg-black text-white hover:scale-110 active:scale-95'}
                    `}
                  >
                    {isUploaded ? <CheckCircle2 size={18} /> : <UploadCloud size={18} />}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Info Note */}
        <div className="flex items-center gap-3 px-4 mb-10">
          <Shield size={14} className="text-gray-300 shrink-0" />
          <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
            Documents are securely stored and manually verified by our team.
          </p>
        </div>

        {/* Continue Button */}
        <motion.button
          whileHover={allUploaded && !isUploading ? { scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' } : {}}
          whileTap={allUploaded && !isUploading ? { scale: 0.98 } : {}}
          onClick={handleContinue}
          disabled={!allUploaded || isUploading}
          className={`
            w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2
            ${allUploaded && !isUploading 
              ? 'bg-black text-white' 
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Processing...
            </>
          ) : 'Continue'}
        </motion.button>
      </div>
    </div>
  )
}