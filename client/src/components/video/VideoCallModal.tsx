import React, { useEffect, useRef } from 'react'
import { useVideoCall } from '@/context/VideoCallContext'
import { 
    Phone, 
    PhoneOff, 
    Video, 
    VideoOff, 
    Mic, 
    MicOff, 
    Monitor,
    MonitorOff,
    Minimize2,
    Maximize2
} from 'lucide-react'
import { useState } from 'react'

const VideoCallModal: React.FC = () => {
    const {
        isInCall,
        isCallIncoming,
        isCallOutgoing,
        callerInfo,
        localStream,
        remoteStream,
        isVideoEnabled,
        isAudioEnabled,
        isScreenSharing,
        acceptCall,
        rejectCall,
        endCall,
        toggleVideo,
        toggleAudio,
        toggleScreenShare
    } = useVideoCall()

    const [isMinimized, setIsMinimized] = useState(false)
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)

    // Set up video streams
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream
        }
    }, [localStream])

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream
        }
    }, [remoteStream])

    // Don't render if no call activity
    if (!isInCall && !isCallIncoming && !isCallOutgoing) {
        return null
    }

    // Incoming call UI
    if (isCallIncoming && callerInfo) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-gray-900 rounded-lg p-8 text-center max-w-md w-full mx-4">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                            {callerInfo.username.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            Incoming Call
                        </h3>
                        <p className="text-gray-300">
                            {callerInfo.username} is calling you
                        </p>
                    </div>
                    
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={rejectCall}
                            className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors"
                        >
                            <PhoneOff size={24} />
                        </button>
                        <button
                            onClick={acceptCall}
                            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full transition-colors"
                        >
                            <Phone size={24} />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Outgoing call UI
    if (isCallOutgoing) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-gray-900 rounded-lg p-8 text-center max-w-md w-full mx-4">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <Phone size={32} className="text-white animate-pulse" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            Calling...
                        </h3>
                        <p className="text-gray-300">
                            Waiting for response
                        </p>
                    </div>
                    
                    <button
                        onClick={endCall}
                        className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors"
                    >
                        <PhoneOff size={24} />
                    </button>
                </div>
            </div>
        )
    }

    // Active call UI
    if (isInCall) {
        return (
            <div className={`fixed ${isMinimized ? 'bottom-4 right-4 w-80 h-60' : 'inset-0'} bg-gray-900 z-50 ${isMinimized ? 'rounded-lg shadow-2xl' : ''}`}>
                {/* Header */}
                <div className="flex justify-between items-center p-4 bg-gray-800">
                    <h3 className="text-white font-semibold">
                        {isScreenSharing ? 'Screen Sharing' : 'Video Call'}
                    </h3>
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
                    </button>
                </div>

                {/* Video Container */}
                <div className="relative flex-1 bg-black">
                    {/* Remote Video */}
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    
                    {/* Local Video (Picture-in-Picture) */}
                    <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        {!isVideoEnabled && (
                            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                <VideoOff size={20} className="text-gray-400" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center items-center p-4 bg-gray-800 space-x-4">
                    <button
                        onClick={toggleAudio}
                        className={`p-3 rounded-full transition-colors ${
                            isAudioEnabled 
                                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                    >
                        {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                    </button>
                    
                    <button
                        onClick={toggleVideo}
                        className={`p-3 rounded-full transition-colors ${
                            isVideoEnabled 
                                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                    >
                        {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                    </button>
                    
                    <button
                        onClick={toggleScreenShare}
                        className={`p-3 rounded-full transition-colors ${
                            isScreenSharing 
                                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                    >
                        {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
                    </button>
                    
                    <button
                        onClick={endCall}
                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors"
                    >
                        <PhoneOff size={20} />
                    </button>
                </div>
            </div>
        )
    }

    return null
}

export default VideoCallModal
