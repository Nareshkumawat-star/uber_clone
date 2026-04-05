'use client'
import React from 'react'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUser as setReduxUser } from '@/redux/userSlice'
function usegetme(enabled: boolean) {
    const {data:session} = useSession()
    const [user,setUser] = useState(null)
    const [loading,setLoading] = useState(true)
    const [error,setError] = useState(null)
    const dispatch = useDispatch()
    useEffect(() => {
        if (!enabled) return

        const fetchUser = async () => {
            setLoading(true)
            try {
                const { data } = await axios.get("/api/user/me")
                dispatch(setReduxUser(data.user))
                setUser(data.user)
                setError(null)
            } catch (err: any) {
                console.error("Error fetching user:", err)
                setError(err.response?.data?.message || err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [enabled, dispatch])

    return { user, loading, error }
 
}

export default usegetme