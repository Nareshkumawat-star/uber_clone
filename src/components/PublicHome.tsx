'use client'
import React, { useState } from 'react'
import Herosection from './herosection'
import Vechile_slider from './VehicleSlider'
import Authmodel from './Authmodel'

function PublicHome({ setAuthOpen }: { setAuthOpen: (open: boolean) => void }) {
    return (
        <>
        
            <Herosection onBookNow={() => setAuthOpen(true)} />
            <Vechile_slider />
        </>
    )
}

export default PublicHome