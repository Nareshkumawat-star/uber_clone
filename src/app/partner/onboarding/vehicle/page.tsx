'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Bike, Car, Package, Truck, ArrowLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const vehicleTypes = [
  { id: 'bike', label: 'Bike', sub: '2 Wheeler', icon: Bike },
  { id: 'car', label: 'Car', sub: '4 Wheeler', icon: Car },
  { id: 'suv', label: 'SUV', sub: '4 Wheeler', icon: Car },
  { id: 'delivery', label: 'Delivery', sub: '3 Wheeler', icon: Package },
  { id: 'truck', label: 'Truck', sub: '6 Wheeler', icon: Truck },
]

export default function VehicleOnboardingPage() {
  const [selectedType, setSelectedType] = useState('bike')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const res = await axios.get('/api/partner/onboard/vechile')
        if (res.status === 200 && res.data.vechile) {
          const { vechileType, number, vechileModel } = res.data.vechile
          setSelectedType(vechileType || 'bike')
          setVehicleNumber(number || '')
          setVehicleModel(vechileModel || '')
        }
      } catch (err) {
        console.error('Error fetching vehicle details:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchVehicleData()
  }, [])

  // Indian Vehicle Number Regex (e.g., MH 12 AB 1234)
  const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/

  const handleContinue = async () => {
    // Basic validation
    if (!selectedType) {
      setError("Please select a vehicle type")
      return
    }
    if (!vehicleModel || vehicleModel.trim().length < 3) {
      setError("Please enter a valid vehicle model")
      return
    }
    
    const cleanNumber = vehicleNumber.replace(/\s/g, '').toUpperCase()
    if (!vehicleRegex.test(cleanNumber)) {
      setError("Invalid Vehicle Number format (e.g. MH 12 AB 1234)")
      return
    }

    setError(null)
    try {
      const res = await axios.post('/api/partner/onboard/vechile', {
        vechileType: selectedType,
        vechileModel: vehicleModel.trim(),
        vechileNumber: cleanNumber
      });
      
      if (res.status === 201 || res.status === 200) {
        router.push('/partner/onboarding/Documents')
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg)
    }
  }

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
      <div className="w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl p-6 md:p-10 relative overflow-hidden">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <button 
            onClick={() => router.push('/')}
            className="absolute left-6 top-6 w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-black hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">
            step 1 of 3
          </span>
          <h1 className="text-3xl font-black text-black tracking-tight mb-1">
            Vehicle Details
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            Add your vehicle information
          </p>
        </div>

        {/* Vehicle Selection Grid */}
        <div className="w-full">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
            Vehicle Type
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-10">
            {vehicleTypes.map((type) => {
              const isSelected = selectedType === type.id
              const Icon = type.icon

              return (
                <motion.div
                  key={type.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedType(type.id)}
                  className={`
                    relative cursor-pointer rounded-2xl p-4 flex flex-col items-center justify-center transition-all duration-300 border
                    ${isSelected 
                      ? 'bg-black/5 border-black/20 shadow-md ring-1 ring-black/5' 
                      : 'bg-white border-black/[0.05] hover:border-black/10'
                    }
                  `}
                >
                  <motion.div
                    animate={{
                      backgroundColor: isSelected ? '#FFFFFF' : '#F3F4F6',
                      scale: isSelected ? 1.05 : 1
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm"
                  >
                    <Icon 
                      size={24}
                      strokeWidth={isSelected ? 2.5 : 2}
                      className={isSelected ? 'text-black' : 'text-gray-400'} 
                    />
                  </motion.div>

                  <div className="text-center">
                    <p className={`text-[10px] font-black uppercase tracking-tight leading-none ${isSelected ? 'text-black' : 'text-gray-400'}`}>
                      {type.label}
                    </p>
                    <p className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${isSelected ? 'text-black/40' : 'text-gray-300'}`}>
                      {type.sub}
                    </p>
                  </div>

                  {isSelected && (
                    <motion.div
                      layoutId="selection-ring"
                      className="absolute inset-0 rounded-2xl border-2 border-black/10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Vehicle Details Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ">
                  Vehicle Number
                </label>
                {vehicleNumber.replace(/\s/g, '').length > 0 && vehicleNumber.replace(/\s/g, '').length < 10 && (
                  <span className="text-[8px] font-bold text-red-500 uppercase animate-pulse">
                    10 CHARS REQUIRED
                  </span>
                )}
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors">
                  <span className="text-xs font-bold font-mono">#</span>
                </div>
                <input 
                  type="text" 
                  value={vehicleNumber}
                  onChange={(e) => {
                    const rawVal = e.target.value.toUpperCase().replace(/\s/g, '')
                    let filtered = ""
                    
                    for (let i = 0; i < rawVal.length; i++) {
                      const char = rawVal[i]
                      if (i === 0 || i === 1 || i === 4 || i === 5) {
                        if (/[A-Z]/.test(char)) filtered += char
                      } else {
                        if (/[0-9]/.test(char)) filtered += char
                      }
                      if (filtered.length >= 10) break
                    }

                    let formatted = ""
                    if (filtered.length > 0) formatted += filtered.slice(0, 2)
                    if (filtered.length > 2) formatted += " " + filtered.slice(2, 4)
                    if (filtered.length > 4) formatted += " " + filtered.slice(4, 6)
                    if (filtered.length > 6) formatted += " " + filtered.slice(6, 10)
                    
                    setVehicleNumber(formatted.trim())
                    if (error) setError(null)
                  }}
                  maxLength={13}
                  placeholder="e.g. MH 12 AB 1234"
                  className={`w-full bg-gray-50 border ${error?.includes('Number') ? 'border-red-500/50' : 'border-transparent'} focus:border-black/10 focus:bg-white rounded-2xl py-4 pl-12 pr-6 text-xs font-bold transition-all outline-none text-black placeholder:text-gray-300`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ">
                  Vehicle Model
                </label>
                {vehicleModel.length > 0 && vehicleModel.length < 3 && (
                  <span className="text-[8px] font-bold text-red-500 uppercase animate-pulse">
                    3+ CHARS REQUIRED
                  </span>
                )}
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors">
                  <Car size={16} />
                </div>
                <input 
                  type="text" 
                  value={vehicleModel}
                  onChange={(e) => {
                    let val = e.target.value.toUpperCase()
                    val = val.replace(/[^A-Z0-9\s]/g, '')
                    setVehicleModel(val)
                    if (error?.includes('model')) setError(null)
                  }}
                  placeholder="e.g. HONDA ACTIVA 6G"
                  className={`w-full bg-gray-50 border ${error?.includes('model') ? 'border-red-500/50' : 'border-transparent'} focus:border-black/10 focus:bg-white rounded-2xl py-4 pl-12 pr-6 text-xs font-bold transition-all outline-none text-black placeholder:text-gray-300 uppercase`}
                />
              </div>
            </div>
          </div>



          {/* Error Message Display */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold">!</div>
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                {error}
              </p>
            </motion.div>
          )}
        </div>


        {/* Continue Button */}
        <div className="mt-12 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleContinue}
            disabled={!vehicleNumber || !vehicleModel}
            className="bg-black text-white px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          >
            Continue
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
