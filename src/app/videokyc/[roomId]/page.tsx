'use client'
import React, { useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { Video, Loader2 } from 'lucide-react'
import axios from 'axios'

function VideoKycPage() {
    const params = useParams()
    const router = useRouter()
    const roomId = params?.roomId as string
    const containerRef = useRef<HTMLDivElement>(null)
    const [isStarting, setIsStarting] = useState(false)
    const [isInCall, setIsInCall] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const { userdata } = useSelector((state: RootState) => state.user)
    const hasJoinedRef = useRef(false)

    const startCall = async () => {
        if (isStarting || isInCall || hasJoinedRef.current) return
        setIsStarting(true)
        hasJoinedRef.current = true

        try {
            const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt')
            
            const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
            const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET as string

            const userID = userdata?._id || `user_${Date.now()}`
            const userName = userdata?.name || 'User'

            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appID,
                serverSecret,
                roomId,
                userID,
                userName
            )

            const zc = ZegoUIKitPrebuilt.create(kitToken)

            zc.joinRoom({
                container: containerRef.current!,
                scenario: {
                    mode: ZegoUIKitPrebuilt.OneONoneCall,
                },
                showPreJoinView: false,
                turnOnCameraWhenJoining: true,
                turnOnMicrophoneWhenJoining: true,
                showLeaveRoomConfirmDialog: true,
                onLeaveRoom: () => {
                    router.push('/')
                },
            })

            setIsInCall(true)
        } catch (error) {
            console.error('Failed to start call:', error)
            hasJoinedRef.current = false
            alert('Failed to start video call. Please check camera/mic permissions.')
        } finally {
            setIsStarting(false)
        }
    }

    const handleKycAction = async (action: 'approve' | 'reject') => {
        let reason = ''
        if (action === 'reject') {
            reason = prompt('Please enter rejection reason:') || ''
            if (!reason) return
        }

        try {
            setIsProcessing(true)
            await axios.patch('/api/admin/videokyc/pending', { 
                partnerId: roomId, // In this flow, roomId is the partner's userId
                action,
                reason 
            })
            alert(`Partner KYC ${action}d successfully.`)
            router.push('/')
        } catch (error) {
            console.error('Action failed:', error)
            alert('Failed to process action.')
        } finally {
            setIsProcessing(false)
        }
    }

    if (!userdata) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black">
            {!isInCall && (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-10 max-w-md w-full mx-4 text-center shadow-2xl">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Video className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-black mb-2">Video KYC</h1>
                        <p className="text-gray-400 text-sm mb-8">
                            {userdata.role === 'admin' 
                                ? 'Start the verification call with the partner.' 
                                : 'Join the verification call with our team.'}
                        </p>
                        <button
                            onClick={startCall}
                            disabled={isStarting}
                            className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all active:scale-95 disabled:bg-gray-300 flex items-center justify-center gap-2"
                        >
                            {isStarting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Video className="w-4 h-4" />
                                    {userdata.role === 'admin' ? 'Start Call' : 'Join Call'}
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-3 mt-3 text-gray-400 text-sm font-medium hover:text-black transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            )}
            <div ref={containerRef} style={{ width: '100%', height: isInCall ? '100vh' : '0', overflow: 'hidden' }} />
            
            {/* Admin Controls Overlay */}
            {isInCall && userdata?.role === 'admin' && (
                <div className="absolute top-10 right-10 z-[999] flex flex-col gap-4 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl">
                    <div className="flex flex-col gap-3">
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest text-center mb-1">
                            Admin KYC Controls
                        </p>
                        <button
                            onClick={() => handleKycAction('approve')}
                            disabled={isProcessing}
                            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            Approve Partner
                        </button>
                        <button
                            onClick={() => handleKycAction('reject')}
                            disabled={isProcessing}
                            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            Reject Partner
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VideoKycPage
