'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'next/navigation'

function ReviewPage() {
    const params = useParams()
    const id = params?.id
    
    const [isLoading, setIsLoading] = useState(true)
    const [partnerData, setPartnerData] = useState<any>(null)

    useEffect(() => {
        const handlegetpartner = async () => {
            if (!id) return;
            
            try {
                setIsLoading(true);
                // Corrected template literal and endpoint using the ID from params
                const res = await axios.get(`/api/admin/reviews/partner/${id}`);
                // The API route returns { partner, vechile, document, bank }
                setPartnerData(res.data);
            } catch (error) {
                console.error("Failed to fetch partner details:", error);
            } finally {
                setIsLoading(false);
            }
        }

        handlegetpartner();
    }, [id]);

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading details...</div>
    }

    if (!partnerData) {
        return <div className="p-8 text-center text-red-500">Failed to load partner details.</div>
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Partner Review Details</h1>
            
            {/* Temporary view to check if data is loading correctly */}
            <pre className="bg-gray-100 p-6 rounded-2xl overflow-auto text-sm">
                {JSON.stringify(partnerData, null, 2)}
            </pre>
        </div>
    )
}

export default ReviewPage