'use client'
import React, { useState } from 'react'
import Herosection from './herosection'
import Vechile_slider from './VehicleSlider'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { useRouter } from 'next/navigation'

function PublicHome({ setAuthOpen }: { setAuthOpen: (open: boolean) => void }) {
    const { userdata } = useSelector((state: RootState) => state.user)
    const router = useRouter()

    const handleBookNow = () => {
        if (userdata) {
            router.push('/user/book')
        } else {
            setAuthOpen(true)
        }
    }

    return (
        <>
            <Herosection onBookNow={handleBookNow} />
            <Vechile_slider />
        </>
    )
}

export default PublicHome