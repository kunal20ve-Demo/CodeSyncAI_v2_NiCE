import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useSocket } from './SocketContext'
import { useAppContext } from './AppContext'
import toast from 'react-hot-toast'

interface SimpleVideoCallContextType {
    // Call state
    isInCall: boolean
    isCallIncoming: boolean
    isCallOutgoing: boolean
    callerInfo: { username: string; socketId: string; offer?: RTCSessionDescriptionInit } | null
    
    // Media state
    localStream: MediaStream | null
    remoteStream: MediaStream | null
    isVideoEnabled: boolean
    isAudioEnabled: boolean
    
    // Actions
    startCall: (targetSocketId: string, targetUsername: string) => void
    acceptCall: () => void
    rejectCall: () => void
    endCall: () => void
    toggleVideo: () => void
    toggleAudio: () => void
}

const SimpleVideoCallContext = createContext<SimpleVideoCallContextType | null>(null)

export const useSimpleVideoCall = () => {
    const context = useContext(SimpleVideoCallContext)
    if (!context) {
        throw new Error('useSimpleVideoCall must be used within SimpleVideoCallProvider')
    }
    return context
}

interface SimpleVideoCallProviderProps {
    children: React.ReactNode
}

export const SimpleVideoCallProvider: React.FC<SimpleVideoCallProviderProps> = ({ children }) => {
    const { socket } = useSocket()
    const { currentUser } = useAppContext()
    
    // Call state
    const [isInCall, setIsInCall] = useState(false)
    const [isCallIncoming, setIsCallIncoming] = useState(false)
    const [isCallOutgoing, setIsCallOutgoing] = useState(false)
    const [callerInfo, setCallerInfo] = useState<{ username: string; socketId: string; offer?: RTCSessionDescriptionInit } | null>(null)
    
    // Media state
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const [isVideoEnabled, setIsVideoEnabled] = useState(true)
    const [isAudioEnabled, setIsAudioEnabled] = useState(true)
    const [isEndingCall, setIsEndingCall] = useState(false)
    
    // Refs
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

    // WebRTC Configuration
    const rtcConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ]
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

    // Create peer connection
    const createPeerConnection = () => {
        const peerConnection = new RTCPeerConnection(rtcConfig)
        
        peerConnection.onicecandidate = (event) => {
            console.log('ICE candidate:', event.candidate)
            if (event.candidate && callerInfo) {
                socket.emit('ice-candidate', {
                    candidate: event.candidate,
                    targetSocketId: callerInfo.socketId
                })
            }
        }
        
        peerConnection.ontrack = (event) => {
            console.log('Received remote stream:', event.streams[0])
            setRemoteStream(event.streams[0])
        }
        
        peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', peerConnection.connectionState)
        }
        
        return peerConnection
    }

    // Start a call
    const startCall = async (targetSocketId: string, targetUsername: string) => {
        try {
            console.log('Starting call to:', targetUsername, targetSocketId)
            
            // Set outgoing call state immediately
            setIsCallOutgoing(true)
            setCallerInfo({ username: targetUsername, socketId: targetSocketId })
            
            const stream = await getUserMedia(true, true)
            setLocalStream(stream)
            
            const peerConnection = createPeerConnection()
            peerConnectionRef.current = peerConnection
            
            // Add local stream to peer connection
            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream)
            })
            
            // Create offer
            const offer = await peerConnection.createOffer()
            await peerConnection.setLocalDescription(offer)
            
            console.log('Sending call offer to:', targetUsername)
            console.log('Socket connected before emit:', socket.connected)
            socket.emit('call-user', {
                targetSocketId,
                targetUsername,
                callerUsername: currentUser.username,
                offer: offer
            })
            console.log('Call offer sent successfully')
            
        } catch (error) {
            console.error('Error starting call:', error)
            setIsCallOutgoing(false)
            setCallerInfo(null)
            toast.error('Failed to start call')
        }
    }

    // Accept incoming call
    const acceptCall = async () => {
        if (!callerInfo) return
        
        try {
            const stream = await getUserMedia(true, true)
            setLocalStream(stream)
            
            const peerConnection = createPeerConnection()
            peerConnectionRef.current = peerConnection
            
            // Add local stream to peer connection
            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream)
            })
            
            // Set remote description (offer) and create answer
            if (callerInfo.offer) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(callerInfo.offer))
                const answer = await peerConnection.createAnswer()
                await peerConnection.setLocalDescription(answer)
                
                // Send answer back to caller
                socket.emit('accept-call', {
                    callerSocketId: callerInfo.socketId,
                    answer: answer
                })
            }
            
            setIsCallIncoming(false)
            setIsInCall(true)
            
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
    const endCall = useCallback(() => {
        console.log('📴 Ending call - current state:', { isInCall, isCallIncoming, isCallOutgoing })
        
        // Prevent multiple calls to endCall
        if (!isInCall && !isCallIncoming && !isCallOutgoing) {
            console.log('📴 Call already ended, skipping cleanup')
            return
        }
        
        // Prevent rapid multiple calls
        if (isEndingCall) {
            console.log('📴 Already ending call, skipping')
            return
        }
        
        setIsEndingCall(true)
        
        // Store current state to know if we should notify
        const wasInCall = isInCall
        
        // Clean up peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close()
            peerConnectionRef.current = null
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
        setIsVideoEnabled(true)
        setIsAudioEnabled(true)
        
        // Notify other peer only if we were actually in a call
        if (wasInCall && socket) {
            socket.emit('end-call')
        }
        
        // Show notification only if we ended an active call
        if (wasInCall) {
            toast.success('Call ended')
        }
        
        // Reset the ending flag after a short delay
        setTimeout(() => {
            setIsEndingCall(false)
        }, 1000)
    }, [isInCall, isCallIncoming, isCallOutgoing, localStream, socket, isEndingCall])

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

    // Socket event listeners
    useEffect(() => {
        if (!socket) {
            console.log('No socket connection available')
            return
        }

        console.log('Setting up socket event listeners for user:', currentUser.username)
        console.log('Socket connected:', socket.connected)
        console.log('Socket ID:', socket.id)

        // Incoming call
        const handleIncomingCall = ({ callerUsername, callerSocketId, offer }: any) => {
            console.log('📞 Incoming call from:', callerUsername, 'with offer:', offer)
            setCallerInfo({ username: callerUsername, socketId: callerSocketId, offer })
            setIsCallIncoming(true)
            toast.success(`Incoming call from ${callerUsername}`)
        }

        // Call accepted
        const handleCallAccepted = async ({ answer }: any) => {
            console.log('✅ Call accepted with answer:', answer)
            if (peerConnectionRef.current && answer) {
                try {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))
                    setIsCallOutgoing(false)
                    setIsInCall(true)
                    toast.success('Call connected!')
                } catch (error) {
                    console.error('Error setting remote description:', error)
                    toast.error('Failed to connect call')
                }
            }
        }

        // Call rejected
        const handleCallRejected = () => {
            console.log('❌ Call was rejected')
            toast.error('Call was rejected')
            setIsCallOutgoing(false)
            endCall()
        }

        // Call ended
        const handleCallEnded = () => {
            console.log('📴 Call ended by remote user')
            
            // Only show notification if we're actually in a call
            if (isInCall || isCallIncoming || isCallOutgoing) {
                toast('Call ended by other user')
            }
            
            // Clean up without sending another end-call event
            if (localStream) {
                localStream.getTracks().forEach(track => {
                    track.stop()
                })
            }
            
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close()
                peerConnectionRef.current = null
            }
            
            // Reset states
            setLocalStream(null)
            setRemoteStream(null)
            setIsInCall(false)
            setIsCallIncoming(false)
            setIsCallOutgoing(false)
            setCallerInfo(null)
            setIsVideoEnabled(true)
            setIsAudioEnabled(true)
        }

        // ICE candidate
        const handleIceCandidate = async ({ candidate }: any) => {
            console.log('🧊 Received ICE candidate:', candidate)
            if (peerConnectionRef.current && candidate) {
                try {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
                } catch (error) {
                    console.error('Error adding ICE candidate:', error)
                }
            }
        }

        // Test socket connection
        socket.emit('test-video-call', { message: 'Testing video call socket connection' })
        
        // Register event listeners
        socket.on('incoming-call', handleIncomingCall)
        socket.on('call-accepted', handleCallAccepted)
        socket.on('call-rejected', handleCallRejected)
        socket.on('call-ended', handleCallEnded)
        socket.on('ice-candidate', handleIceCandidate)

        return () => {
            console.log('Cleaning up socket event listeners')
            socket.off('incoming-call', handleIncomingCall)
            socket.off('call-accepted', handleCallAccepted)
            socket.off('call-rejected', handleCallRejected)
            socket.off('call-ended', handleCallEnded)
            socket.off('ice-candidate', handleIceCandidate)
        }
    }, [socket, currentUser, isInCall, isCallIncoming, isCallOutgoing, localStream])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            endCall()
        }
    }, [])

    const value: SimpleVideoCallContextType = {
        isInCall,
        isCallIncoming,
        isCallOutgoing,
        callerInfo,
        localStream,
        remoteStream,
        isVideoEnabled,
        isAudioEnabled,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleVideo,
        toggleAudio
    }

    return (
        <SimpleVideoCallContext.Provider value={value}>
            {children}
        </SimpleVideoCallContext.Provider>
    )
}
