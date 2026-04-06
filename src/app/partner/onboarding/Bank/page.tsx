'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, UserCheck, CreditCard, Building2, Smartphone, Zap, CheckCircle2, Landmark, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function BankSetupPage() {
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    mobileNumber: '',
    upiId: '',
    bankName: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchBankData = async () => {
      try {
        const res = await axios.get('/api/partner/onboard/bank')
        if (res.status === 200 && res.data.bank) {
          const { bankname, accountholder, accountnumber, ifsc, upi } = res.data.bank
          setFormData({
            bankName: bankname || '',
            accountName: accountholder || '',
            accountNumber: accountnumber || '',
            ifscCode: ifsc || '',
            upiId: upi || '',
            mobileNumber: res.data.mobileNumber || '',
          })
        }
      } catch (err) {
        console.error('Error fetching bank data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBankData()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isFormValid = formData.accountName && formData.accountNumber && formData.ifscCode && formData.mobileNumber.length === 10 && formData.bankName

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-black" size={40} />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading details...</p>
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
            onClick={() => router.back()}
            className="absolute left-6 top-6 w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-black hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">
            step 3 of 3
          </span>
          <h1 className="text-3xl font-black text-black tracking-tight mb-1">
            Bank & Payout Setup
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            Used for partner payouts
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 mb-10">
          {[
            { id: 'bankName', label: 'Bank Name', placeholder: 'e.g. HDFC Bank', icon: Landmark },
            { id: 'accountName', label: 'Account holder name', placeholder: 'As per bank records', icon: UserCheck },
            { id: 'accountNumber', label: 'Bank account number', placeholder: 'Enter account number', icon: CreditCard },
            { id: 'ifscCode', label: 'IFSC code', placeholder: 'e.g. HDFC0001234', icon: Building2 },
            { id: 'mobileNumber', label: 'Mobile number', placeholder: '10 digit mobile number', icon: Smartphone },
            { id: 'upiId', label: 'UPI ID (optional)', placeholder: 'name@upi', icon: Zap },
          ].map((field) => (
            <div key={field.id} className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                {field.label}
              </label>
              <div className="relative group border-b border-gray-100 focus-within:border-black transition-colors pb-1">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors">
                  <field.icon size={18} />
                </div>
                <input 
                  type="text" 
                  value={formData[field.id as keyof typeof formData]}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full bg-transparent py-4 pl-8 pr-4 text-xs font-bold transition-all outline-none text-black placeholder:text-gray-200"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Verification Note */}
        <div className="flex items-start gap-3 px-2 mb-10">
          <CheckCircle2 size={14} className="text-gray-300 shrink-0 mt-0.5" />
          <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
            Bank details are verified before first payout. This usually takes 24–48 hours.
          </p>
        </div>

        {/* Final Continue Button */}
        <motion.button
          whileHover={isFormValid && !isSubmitting ? { scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' } : {}}
          whileTap={isFormValid && !isSubmitting ? { scale: 0.98 } : {}}
          onClick={async () => {
            if (isFormValid && !isSubmitting) {
              setIsSubmitting(true)
              try {
                const res = await axios.post('/api/partner/onboard/bank', {
                  bankname: formData.bankName,
                  accountholder: formData.accountName,
                  accountnumber: formData.accountNumber,
                  ifsc: formData.ifscCode,
                  upi: formData.upiId,
                  mobileNumber: formData.mobileNumber
                })

                if (res.status === 201 || res.status === 200) {
                  router.push('/partner/dashboard')
                }
              } catch (error) {
                console.error('Submission failed:', error)
              } finally {
                setIsSubmitting(false)
              }
            }
          }}
          disabled={!isFormValid || isSubmitting}
          className={`
            w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2
            ${isFormValid && !isSubmitting 
              ? 'bg-black text-white' 
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Saving Details...
            </>
          ) : 'Complete Onboarding'}
        </motion.button>
      </div>
    </div>
  )
}