'use client'
import React from 'react'
import { useRef } from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

function ZegoCall() {
    const { userdata } = useSelector((state: RootState) => state.user);
    const myref = useRef<HTMLDivElement>(null);

    const startcall = async () => {
        try {
            if (!myref.current) return;

            const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
            const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;

            if (!appID || !serverSecret) {
                console.error("Zego AppID or ServerSecret is missing in environment variables.");
                return;
            }

            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appID,
                serverSecret,
                "room1",
                userdata?._id.toString() || "user_" + Date.now(),
                userdata?.name || "Guest"
            );

            const zp = ZegoUIKitPrebuilt.create(kitToken);
            zp.joinRoom({
                container: myref.current,
                scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
            });
        } catch (error) {
            console.error("Zego initialization error:", error);
        }
    };

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <h1 className="text-2xl font-bold mb-6 text-black">Video Call</h1>
            <button
                onClick={startcall}
                className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition shadow-lg mb-8 font-semibold"
            >
                Start Video Call
            </button>
            <div
                ref={myref}
                className="w-full max-w-4xl h-[600px] border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white shadow-md text-black"
            >
                {!myref.current && (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Camera preview will appear here
                    </div>
                )}
            </div>
        </div>
    );
}

export default ZegoCall;
