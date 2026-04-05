'use client'
import React from 'react'
import { useSession } from 'next-auth/react'
import usegetme from './hooks/usegetme'

function InitUser() {
    const { status } = useSession()
    usegetme(status === "authenticated")

    return null
}

export default InitUser