import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import Peer from 'simple-peer'
import { useSocket } from './SocketContext'
import { useAppContext } from './AppContext'
import toast from 'react-hot-toast'

interface VideoCallContextType {
    // Call state
    isInCall: boolean
    isCallIncoming: boolean
    isCallOutgoing: boolean
    callerInfo: { username: string; socketId: string } | null
    
    // Media state
    localStream: MediaStream | null
    remoteStream: MediaStream | null
    isVideoEnabled: boolean
    isAudioEnabled: boolean
    isScreenSharing: boolean
    
    // Actions
    startCall: (targetSocketId: string, targetUsername: string) => void
    acceptCall: () => void
    rejectCall: () => void
    endCall: () => void
    toggleVideo: () => void
    toggleAudio: () => void
    toggleScreenShare: () => void
}

const VideoCallContext = createContext<VideoCallContextType | null>(null)

export const useVideoCall = () => {
    const context = useContext(VideoCallContext)
    if (!context) {
        throw new Error('useVideoCall must be used within VideoCallProvider')
    }
    return context
}

interface VideoCallProviderProps {
    children: React.ReactNode
}

export const VideoCallProvider: React.FC<VideoCallProviderProps> = ({ children }) => {
    const { socket } = useSocket()
    const { currentUser } = useAppContext()
    
    // Call state
    const [isInCall, setIsInCall] = useState(false)
    const [isCallIncoming, setIsCallIncoming] = useState(false)
    const [isCallOutgoing, setIsCallOutgoing] = useState(false)
    const [callerInfo, setCallerInfo] = useState<{ username: string; socketId: string } | null>(null)
    
    // Media state
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const [isVideoEnabled, setIsVideoEnabled] = useState(true)
    const [isAudioEnabled, setIsAudioEnabled] = useState(true)
    const [isScreenSharing, setIsScreenSharing] = useState(false)
    
    // Refs
    const peerRef = useRef<Peer.Instance | null>(null)
    const originalStreamRef = useRef<MediaStream | null>(null)
    
    // WebRTC Configuration
    const peerConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ],
        sdpSemantics: 'unified-plan'
    }

    // Get user media
    const getUserMedia = async (video = true, audio = true) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: video ? { width: 640, height: 480 } : false,
                audio: audio
            })
            return stream
        } catch (error) {
            console.error('Error accessing media devices:', error)
            toast.error('Could not access camera/microphone')
            throw error
        }
    }

    // Start a call
    const startCall = async (targetSocketId: string, targetUsername: string) => {
        try {
            const stream = await getUserMedia(true, true)
            setLocalStream(stream)
            setIsCallOutgoing(true)
            
            // Create peer as initiator
            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: stream,
                config: peerConfig
            })
            
            peerRef.current = peer
            
            peer.on('signal', (signal) => {
                socket.emit('call-user', {
                    targetSocketId,
                    targetUsername,
                    callerUsername: currentUser.username,
                    signalData: signal
                })
            })
            
            peer.on('stream', (remoteStream) => {
                setRemoteStream(remoteStream)
                setIsInCall(true)
                setIsCallOutgoing(false)
            })
            
            peer.on('error', (error) => {
                console.error('Peer error:', error)
                toast.error('Call failed')
                endCall()
            })
            
        } catch (error) {
            console.error('Error starting call:', error)
            setIsCallOutgoing(false)
        }
    }

    // Accept incoming call
    const acceptCall = async () => {
        try {
            const stream = await getUserMedia(true, true)
            setLocalStream(stream)
            
            // Create peer as receiver
            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream: stream,
                config: peerConfig
            })
            
            peerRef.current = peer
            
            peer.on('signal', (signal) => {
                socket.emit('accept-call', {
                    callerSocketId: callerInfo?.socketId,
                    signalData: signal
                })
            })
            
            peer.on('stream', (remoteStream) => {
                setRemoteStream(remoteStream)
                setIsInCall(true)
                setIsCallIncoming(false)
            })
            
            peer.on('error', (error) => {
                console.error('Peer error:', error)
                toast.error('Call failed')
                endCall()
            })
            
            // Signal the peer with caller's signal data
            // This will be handled by socket events
            
        } catch (error) {
            console.error('Error accepting call:', error)
            rejectCall()
        }
    }

    // Reject call
    const rejectCall = () => {
        socket.emit('reject-call', { callerSocketId: callerInfo?.socketId })
        setIsCallIncoming(false)
        setCallerInfo(null)
    }

    // End call
    const endCall = () => {
        // Clean up peer connection
        if (peerRef.current) {
            peerRef.current.destroy()
            peerRef.current = null
        }
        
        // Stop local stream
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop())
            setLocalStream(null)
        }
        
        // Clean up state
        setRemoteStream(null)
        setIsInCall(false)
        setIsCallIncoming(false)
        setIsCallOutgoing(false)
        setCallerInfo(null)
        setIsScreenSharing(false)
        originalStreamRef.current = null
        
        // Notify other peer
        socket.emit('end-call')
    }

    // Toggle video
    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0]
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled
                setIsVideoEnabled(videoTrack.enabled)
            }
        }
    }

    // Toggle audio
    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled
                setIsAudioEnabled(audioTrack.enabled)
            }
        }
    }

    // Toggle screen share
    const toggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                // Start screen sharing
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                })
                
                // Store original stream
                originalStreamRef.current = localStream
                
                // Replace video track in peer connection
                if (peerRef.current && localStream) {
                    const videoTrack = screenStream.getVideoTracks()[0]
                    const sender = peerRef.current._pc?.getSenders().find(s => 
                        s.track && s.track.kind === 'video'
                    )
                    
                    if (sender) {
                        await sender.replaceTrack(videoTrack)
                    }
                }
                
                // Update local stream
                const newStream = new MediaStream([
                    screenStream.getVideoTracks()[0],
                    ...(localStream?.getAudioTracks() || [])
                ])
                
                setLocalStream(newStream)
                setIsScreenSharing(true)
                
                // Handle screen share end
                screenStream.getVideoTracks()[0].onended = () => {
                    toggleScreenShare() // This will stop screen sharing
                }
                
            } else {
                // Stop screen sharing
                if (originalStreamRef.current && peerRef.current) {
                    const videoTrack = originalStreamRef.current.getVideoTracks()[0]
                    const sender = peerRef.current._pc?.getSenders().find(s => 
                        s.track && s.track.kind === 'video'
                    )
                    
                    if (sender && videoTrack) {
                        await sender.replaceTrack(videoTrack)
                    }
                }
                
                // Stop screen stream
                if (localStream) {
                    localStream.getVideoTracks().forEach(track => track.stop())
                }
                
                // Restore original stream
                setLocalStream(originalStreamRef.current)
                setIsScreenSharing(false)
                originalStreamRef.current = null
            }
        } catch (error) {
            console.error('Error toggling screen share:', error)
            toast.error('Screen sharing failed')
        }
    }

    // Socket event listeners
    useEffect(() => {
        if (!socket) return

        // Incoming call
        socket.on('incoming-call', ({ callerUsername, callerSocketId, signalData }) => {
            setCallerInfo({ username: callerUsername, socketId: callerSocketId })
            setIsCallIncoming(true)
            
            // Store signal data for when call is accepted
            if (peerRef.current) {
                peerRef.current.signal(signalData)
            }
        })

        // Call accepted
        socket.on('call-accepted', ({ signalData }) => {
            if (peerRef.current) {
                peerRef.current.signal(signalData)
            }
        })

        // Call rejected
        socket.on('call-rejected', () => {
            toast.error('Call was rejected')
            setIsCallOutgoing(false)
            endCall()
        })

        // Call ended
        socket.on('call-ended', () => {
            endCall()
        })

        return () => {
            socket.off('incoming-call')
            socket.off('call-accepted')
            socket.off('call-rejected')
            socket.off('call-ended')
        }
    }, [socket, currentUser])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            endCall()
        }
    }, [])

    const value: VideoCallContextType = {
        isInCall,
        isCallIncoming,
        isCallOutgoing,
        callerInfo,
        localStream,
        remoteStream,
        isVideoEnabled,
        isAudioEnabled,
        isScreenSharing,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleVideo,
        toggleAudio,
        toggleScreenShare
    }

    return (
        <VideoCallContext.Provider value={value}>
            {children}
        </VideoCallContext.Provider>
    )
}
