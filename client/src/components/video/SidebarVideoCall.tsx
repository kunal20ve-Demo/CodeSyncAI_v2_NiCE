import React, { useRef, useEffect } from 'react'
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react'
import { useSimpleVideoCall } from '../../context/SimpleVideoCallContext'

const SidebarVideoCall: React.FC = () => {
    const {
        isInCall,
        callerInfo,
        localStream,
        remoteStream,
        isVideoEnabled,
        isAudioEnabled,
        endCall,
        toggleVideo,
        toggleAudio
    } = useSimpleVideoCall()

    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)

    // Set up video streams
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            console.log('📹 Setting sidebar local video stream')
            localVideoRef.current.srcObject = localStream
        }
    }, [localStream])

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            console.log('📹 Setting sidebar remote video stream')
            remoteVideoRef.current.srcObject = remoteStream
        }
    }, [remoteStream])

    // Don't render if not in call
    if (!isInCall) {
        return null
    }

    return (
        <div className="sidebar-video-call">
            {/* Header */}
            <div className="sidebar-video-header">
                <div className="sidebar-video-status">
                    <div className="sidebar-video-status-dot"></div>
                    <span className="sidebar-video-title">
                        Call with {callerInfo?.username || 'User'}
                    </span>
                </div>
            </div>

            {/* Video Container */}
            <div className="sidebar-video-container">
                {/* Remote Video (Main) */}
                <div className="sidebar-video-remote">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="sidebar-video-remote-video"
                    />
                    
                    {/* Remote Video Placeholder */}
                    {!remoteStream && (
                        <div className="sidebar-video-placeholder">
                            <div className="sidebar-video-placeholder-avatar">
                                {callerInfo?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <p className="sidebar-video-placeholder-text">
                                {callerInfo?.username || 'User'}
                            </p>
                        </div>
                    )}
                    
                    {/* Remote User Name Overlay */}
                    <div className="sidebar-video-name-overlay">
                        {callerInfo?.username || 'User'}
                    </div>
                </div>
                
                {/* Local Video (Small Corner) */}
                <div className="sidebar-video-local">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="sidebar-video-local-video"
                    />
                    
                    {/* Local Video Placeholder */}
                    {(!localStream || !isVideoEnabled) && (
                        <div className="sidebar-video-local-placeholder">
                            <div className="sidebar-video-local-avatar">
                                You
                            </div>
                        </div>
                    )}
                    
                    {/* Status Indicators */}
                    <div className="sidebar-video-local-status">
                        {!isVideoEnabled && <VideoOff size={8} />}
                        {!isAudioEnabled && <MicOff size={8} />}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="sidebar-video-controls">
                <button
                    onClick={toggleAudio}
                    className={`sidebar-video-control-btn ${!isAudioEnabled ? 'muted' : ''}`}
                    title={isAudioEnabled ? 'Mute' : 'Unmute'}
                >
                    {isAudioEnabled ? <Mic size={14} /> : <MicOff size={14} />}
                </button>
                
                <button
                    onClick={toggleVideo}
                    className={`sidebar-video-control-btn ${!isVideoEnabled ? 'muted' : ''}`}
                    title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                    {isVideoEnabled ? <Video size={14} /> : <VideoOff size={14} />}
                </button>
                
                <button
                    onClick={endCall}
                    className="sidebar-video-control-btn end-call"
                    title="End call"
                >
                    <PhoneOff size={14} />
                </button>
            </div>
        </div>
    )
}

export default SidebarVideoCall
