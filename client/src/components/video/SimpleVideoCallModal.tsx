import React, { useEffect, useRef, useState } from 'react'
import { useSimpleVideoCall } from '@/context/SimpleVideoCallContext'
import { 
    Phone, 
    PhoneOff, 
    Video, 
    VideoOff, 
    Mic, 
    MicOff,
    Minimize2,
    Maximize2
} from 'lucide-react'
import ModernAvatar from '../common/ModernAvatar'

// Function to get consistent avatar style for each user
const getAvatarStyle = (username: string): 'adventurer' | 'avataaars' | 'openPeeps' => {
    const styles: ('adventurer' | 'avataaars' | 'openPeeps')[] = ['adventurer', 'avataaars', 'openPeeps']
    
    let hash = 0
    for (let i = 0; i < username.length; i++) {
        const char = username.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    
    const styleIndex = Math.abs(hash) % styles.length
    return styles[styleIndex]
}

const SimpleVideoCallModal: React.FC = () => {
    console.log('🎬 SimpleVideoCallModal component rendered')
    const {
        isInCall,
        isCallIncoming,
        isCallOutgoing,
        callerInfo,
        localStream,
        remoteStream,
        isVideoEnabled,
        isAudioEnabled,
        acceptCall,
        rejectCall,
        endCall,
        toggleVideo,
        toggleAudio
    } = useSimpleVideoCall()

    const [isMinimized, setIsMinimized] = useState(false)
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)

    // Set up video streams
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            console.log('📹 Setting local video stream')
            localVideoRef.current.srcObject = localStream
        }
    }, [localStream])

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            console.log('📹 Setting remote video stream')
            remoteVideoRef.current.srcObject = remoteStream
        }
    }, [remoteStream])

    // Debug logging
    console.log('VideoCallModal render check:', {
        isInCall,
        isCallIncoming,
        isCallOutgoing,
        callerInfo,
        shouldRender: isInCall || isCallIncoming || isCallOutgoing
    })

    // Always render the modal container, but conditionally show content
    const shouldShowModal = isInCall || isCallIncoming || isCallOutgoing
    
    if (!shouldShowModal) {
        return null
    }

    // iOS/macOS Style Incoming Call - Non-blocking overlay
    if (isCallIncoming && callerInfo) {
        console.log('🚨 RENDERING iOS-STYLE INCOMING CALL for:', callerInfo.username)
        return (
            <div className="ios-call-overlay">
                <div className="ios-call-notification">
                    {/* Caller Avatar */}
                    <div className="ios-call-avatar">
                        <div className="ios-avatar-ring"></div>
                        <div className="ios-avatar-inner">
                            <ModernAvatar 
                                name={callerInfo.username} 
                                size={64} 
                                style={getAvatarStyle(callerInfo.username)}
                            />
                        </div>
                    </div>
                    
                    {/* Call Info */}
                    <div className="ios-call-info">
                        <div className="ios-call-status">Incoming video call</div>
                        <div className="ios-caller-name">{callerInfo.username}</div>
                        <div className="ios-call-subtitle">is calling you</div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="ios-call-actions">
                        <button
                            onClick={rejectCall}
                            className="ios-call-btn decline"
                            title="Decline"
                        >
                            <PhoneOff size={20} />
                        </button>
                        <button
                            onClick={acceptCall}
                            className="ios-call-btn accept"
                            title="Accept"
                        >
                            <Phone size={20} />
                        </button>
                    </div>
                    
                    {/* Close button */}
                    <button 
                        onClick={rejectCall}
                        className="ios-call-close"
                        title="Dismiss"
                    >
                        ×
                    </button>
                </div>
            </div>
        )
    }

    // iOS/macOS Style Outgoing Call - Non-blocking
    if (isCallOutgoing) {
        console.log('📱 RENDERING iOS-STYLE OUTGOING CALL')
        return (
            <div className="ios-call-overlay">
                <div className="ios-call-notification outgoing">
                    {/* Calling Avatar */}
                    <div className="ios-call-avatar calling">
                        <div className="ios-avatar-ring calling"></div>
                        <div className="ios-avatar-inner">
                            <ModernAvatar 
                                name={callerInfo?.username || 'User'} 
                                size={64} 
                                style={getAvatarStyle(callerInfo?.username || 'User')}
                            />
                        </div>
                    </div>
                    
                    {/* Call Info */}
                    <div className="ios-call-info">
                        <div className="ios-call-status">Calling...</div>
                        <div className="ios-caller-name">{callerInfo?.username || 'User'}</div>
                        <div className="ios-call-subtitle">Waiting for response</div>
                    </div>
                    
                    {/* Cancel Button */}
                    <div className="ios-call-actions">
                        <button
                            onClick={endCall}
                            className="ios-call-btn decline"
                            title="Cancel"
                        >
                            <PhoneOff size={20} />
                        </button>
                    </div>
                    
                    {/* Close button */}
                    <button 
                        onClick={endCall}
                        className="ios-call-close"
                        title="Cancel call"
                    >
                        ×
                    </button>
                </div>
            </div>
        )
    }

    // Active call UI - Now handled by SidebarVideoCall component
    if (isInCall) {
        console.log('📹 Active call - handled by SidebarVideoCall component')
        // Return null since we're using the sidebar video call component
        return null
    }

    // Legacy full-screen interface (commented out - using sidebar instead)
    if (false && isInCall) {
        console.log('📹 RENDERING GOOGLE MEET STYLE VIDEO CALL')
        return (
            <div className="video-call-active video-call-active-google-meet">
                {/* Header Bar */}
                <div className="video-call-header">
                    <div className="video-call-header-left">
                        <div className="video-call-status-indicator"></div>
                        <span className="video-call-header-title">
                            Video call with {callerInfo?.username || 'User'}
                        </span>
                        <span className="video-call-duration">00:00</span>
                    </div>
                    <div className="video-call-header-right">
                        <button 
                            className="video-call-header-btn"
                            onClick={() => setIsMinimized(!isMinimized)}
                            title={isMinimized ? 'Maximize' : 'Minimize'}
                        >
                            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                        </button>
                    </div>
                </div>

                {/* Main Video Area */}
                <div className="video-call-main-area">
                    {/* Remote Video (Main) */}
                    <div className="video-call-remote-container">
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="video-call-remote-video"
                            onLoadedMetadata={() => console.log('📹 Remote video loaded')}
                        />
                        
                        {/* Remote Video Placeholder */}
                        {!remoteStream && (
                            <div className="video-call-placeholder">
                                <div className="video-call-placeholder-avatar">
                                    {callerInfo?.username?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <p className="video-call-placeholder-text">
                                    {callerInfo?.username || 'User'}
                                </p>
                                <p className="video-call-placeholder-subtext">
                                    Camera is off
                                </p>
                            </div>
                        )}
                        
                        {/* Remote User Info Overlay */}
                        <div className="video-call-user-info">
                            <span>{callerInfo?.username || 'User'}</span>
                        </div>
                    </div>
                    
                    {/* Local Video (Picture-in-Picture) */}
                    <div className="video-call-local-container">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="video-call-local-video"
                            onLoadedMetadata={() => console.log('📹 Local video loaded')}
                        />
                        
                        {/* Local Video Placeholder */}
                        {(!localStream || !isVideoEnabled) && (
                            <div className="video-call-local-placeholder">
                                <div className="video-call-local-avatar">
                                    You
                                </div>
                            </div>
                        )}
                        
                        {/* Local Video Controls Overlay */}
                        <div className="video-call-local-controls">
                            {!isVideoEnabled && <VideoOff size={12} />}
                            {!isAudioEnabled && <MicOff size={12} />}
                        </div>
                    </div>
                </div>

                {/* Google Meet Style Controls */}
                <div className="video-call-controls">
                    <div className="video-call-controls-left">
                        <div className="video-call-meeting-info">
                            <span className="video-call-meeting-id">Meeting ID: {Math.random().toString(36).substr(2, 9)}</span>
                        </div>
                    </div>
                    
                    <div className="video-call-controls-center">
                        {/* Microphone */}
                        <button
                            onClick={toggleAudio}
                            className={`video-call-control-btn ${
                                isAudioEnabled ? 'active' : 'muted'
                            }`}
                            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                        >
                            {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                        </button>
                        
                        {/* Camera */}
                        <button
                            onClick={toggleVideo}
                            className={`video-call-control-btn ${
                                isVideoEnabled ? 'active' : 'muted'
                            }`}
                            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                        >
                            {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                        </button>
                        
                        {/* End Call */}
                        <button
                            onClick={endCall}
                            className="video-call-control-btn end-call"
                            title="End call"
                        >
                            <PhoneOff size={20} />
                        </button>
                        
                        {/* More Options */}
                        <button
                            className="video-call-control-btn"
                            title="More options"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="5" r="2"/>
                                <circle cx="12" cy="12" r="2"/>
                                <circle cx="12" cy="19" r="2"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div className="video-call-controls-right">
                        <button 
                            className="video-call-control-btn"
                            title="Show participants"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            <span className="video-call-participant-count">2</span>
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return null
}

export default SimpleVideoCallModal

// Force component to always be present in DOM for debugging
// This ensures the modal container is always available
