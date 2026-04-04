'use client'
import React from 'react'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useEffect } from 'react'
import axios from 'axios'
function usegetme() {
    const {data:session} = useSession()
    const [user,setUser] = useState(null)
    const [loading,setLoading] = useState(true)
    const [error,setError] = useState(null)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const {data} = await axios.get("/api/user/me")
                setUser(data.user)
            } catch (error) {
                console.log(error)
            } 
        }
        fetchUser()
    },[])
 
}

export default usegetme