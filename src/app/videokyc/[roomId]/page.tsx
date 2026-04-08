'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

function VideoKycPage() {
    const params = useParams()
    const router = useRouter()
    const roomId = params?.roomId as string
    const containerRef = useRef<HTMLDivElement>(null)
    const [joined, setJoined] = useState(false)
    const { userdata } = useSelector((state: RootState) => state.user)

    useEffect(() => {
        if (!userdata || !roomId || joined) return

        const startCall = async () => {
            const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt')
            
            const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
            const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET as string

            const userID = userdata._id || `user_${Date.now()}`
            const userName = userdata.name || 'User'

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
                showPreJoinView: true,
                turnOnCameraWhenJoining: true,
                turnOnMicrophoneWhenJoining: true,
                showLeaveRoomConfirmDialog: true,
                onLeaveRoom: () => {
                    if (userdata.role === 'admin') {
                        router.push('/')
                    } else {
                        router.push('/')
                    }
                },
            })

            setJoined(true)
        }

        startCall()
    }, [userdata, roomId, joined, router])

    if (!userdata) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
                Loading user data...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black">
            <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />
        </div>
    )
}

export default VideoKycPage
