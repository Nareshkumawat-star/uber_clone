'use client'
import React from 'react'
import dynamic from 'next/dynamic'

// Use dynamic import with ssr disabled to avoid "document is not defined" error
const ZegoCall = dynamic(() => import('@/components/ZegoCall'), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-screen flex items-center justify-center bg-gray-50">
            <div className="text-xl font-semibold text-gray-600">Loading Video Call...</div>
        </div>
    )
});

export default function PAGE() {
  return (
    <main className="w-full min-h-screen">
        <ZegoCall />
    </main>
  )
}