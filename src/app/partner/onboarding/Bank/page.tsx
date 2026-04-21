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
    let formattedValue = value.toUpperCase() // Force uppercase for all fields

    // Real-time filtering based on field type
    if (field === 'accountNumber' || field === 'mobileNumber') {
      // Allow only digits
      formattedValue = formattedValue.replace(/\D/g, '')
      if (field === 'mobileNumber') formattedValue = formattedValue.slice(0, 10)
      if (field === 'accountNumber') formattedValue = formattedValue.slice(0, 18) // Standard bank account max
    }
    
    if (field === 'bankName' || field === 'accountName') {
      // Allow only letters and spaces
      formattedValue = formattedValue.replace(/[^A-Z\s]/g, '')
    }

    if (field === 'ifscCode') {
      // Alphanumeric only, max 11
      formattedValue = formattedValue.replace(/[^A-Z0-9]/g, '').slice(0, 11)
    }

    if (field === 'upiId') {
      // Alphanumeric, @, and dots
      formattedValue = formattedValue.replace(/[^A-Z0-9@.-]/g, '')
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }))
  }

  // Validation Regex
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
  const upiRegex = /^[\w.-]+@[\w.-]+$/

  const isFormValid = 
    formData.accountName.trim().length >= 6 && 
    formData.accountNumber.length >= 9 && 
    ifscRegex.test(formData.ifscCode) && 
    formData.mobileNumber.length === 10 && 
    formData.bankName.trim().length >= 3 &&
    (!formData.upiId || upiRegex.test(formData.upiId)) // UPI is optional but must be valid if entered


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
            onClick={() => router.push('/partner/onboarding/Documents')}
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
          ].map((field) => {
            const val = formData[field.id as keyof typeof formData]
            let errorMessage = ""
            
            if (val) {
              if (field.id === 'ifscCode' && !ifscRegex.test(val)) errorMessage = "INVALID IFSC"
              if (field.id === 'upiId' && !upiRegex.test(val)) errorMessage = "INVALID UPI"
              if (field.id === 'mobileNumber' && val.length < 10) errorMessage = "10 DIGITS REQUIRED"
              if (field.id === 'accountName' && val.length < 6) errorMessage = "6 CHARACTERS REQUIRED"
              if (field.id === 'accountNumber' && val.length < 9) errorMessage = "MIN 9 DIGITS"
              if (field.id === 'bankName' && val.length < 3) errorMessage = "3 CHARACTERS REQUIRED"
            }

            return (
              <div key={field.id} className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ">
                    {field.label}
                  </label>
                  {errorMessage && (
                    <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter animate-pulse">
                      {errorMessage}
                    </span>
                  )}
                </div>
                <div className={`relative group border-b transition-colors pb-1 ${errorMessage ? 'border-red-500/50' : 'border-gray-100 focus-within:border-black'}`}>
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 transition-colors ${errorMessage ? 'text-red-400' : 'text-gray-300 group-focus-within:text-black'}`}>
                    <field.icon size={18} />
                  </div>

                  <input 
                    type="text" 
                    value={val}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-transparent py-4 pl-8 pr-4 text-xs font-bold transition-all outline-none text-black placeholder:text-gray-200"
                  />
                </div>
              </div>
            )
          })}
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
                  window.location.href = '/partner/dashboard'
                }
              } catch (error: any) {
                const msg = error?.response?.data?.error || 'Submission failed. Please try again.'
                alert(msg)
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