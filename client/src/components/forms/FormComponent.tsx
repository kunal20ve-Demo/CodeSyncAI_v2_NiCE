import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS } from "@/types/user"
import { ChangeEvent, FormEvent, useEffect, useRef } from "react"
import { toast } from "react-hot-toast"
import { useLocation, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"

const FormComponent = () => {
    const location = useLocation()
    const { currentUser, setCurrentUser, status, setStatus } = useAppContext()
    const { socket } = useSocket()

    const usernameRef = useRef<HTMLInputElement | null>(null)
    const navigate = useNavigate()

    const createNewRoomId = () => {
        setCurrentUser({ ...currentUser, roomId: uuidv4() })
        toast.success("Created a new Room Id")
        usernameRef.current?.focus()
    }

    const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name
        const value = e.target.value
        setCurrentUser({ ...currentUser, [name]: value })
    }

    const validateForm = () => {
        if (currentUser.username.trim().length === 0) {
            toast.error("Enter your username")
            return false
        } else if (currentUser.roomId.trim().length === 0) {
            toast.error("Enter a room id")
            return false
        } else if (currentUser.roomId.trim().length < 5) {
            toast.error("ROOM Id must be at least 5 characters long")
            return false
        } else if (currentUser.username.trim().length < 3) {
            toast.error("Username must be at least 3 characters long")
            return false
        }
        return true
    }

    const joinRoom = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (status === USER_STATUS.ATTEMPTING_JOIN) return
        if (!validateForm()) return
        toast.loading("Joining room...")
        setStatus(USER_STATUS.ATTEMPTING_JOIN)
        socket.emit(SocketEvent.JOIN_REQUEST, currentUser)
    }

    useEffect(() => {
        if (currentUser.roomId.length > 0) return
        if (location.state?.roomId) {
            setCurrentUser({ ...currentUser, roomId: location.state.roomId })
            if (currentUser.username.length === 0) {
                toast.success("Enter your username")
            }
        }
    }, [currentUser, location.state?.roomId, setCurrentUser])

    useEffect(() => {
        if (status === USER_STATUS.DISCONNECTED && !socket.connected) {
            socket.connect()
            return
        }

        const isRedirect = sessionStorage.getItem("redirect") || false

        if (status === USER_STATUS.JOINED && !isRedirect) {
            const username = currentUser.username
            sessionStorage.setItem("redirect", "true")
            navigate(`/editor/${currentUser.roomId}`, {
                state: {
                    username,
                },
            })
        } else if (status === USER_STATUS.JOINED && isRedirect) {
            sessionStorage.removeItem("redirect")
            setStatus(USER_STATUS.DISCONNECTED)
            socket.disconnect()
            socket.connect()
        }
    }, [currentUser, location.state?.redirect, navigate, setStatus, socket, status])

    return (
        <div style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            padding: '0'
        }}>
            {/* Header */}
            <div style={{
                textAlign: 'center',
                marginBottom: '3rem'
            }}>
                <h1 style={{
                    fontSize: '4rem',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginBottom: '1rem',
                    letterSpacing: '-0.025em',
                    fontFamily: 'Space Grotesk, sans-serif'
                }}>
                    Code Sync
                </h1>
                <p style={{
                    color: '#d1d5db',
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    fontFamily: 'Space Grotesk, sans-serif'
                }}>
                    Code, Chat, Collaborate. It's All in Sync.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={joinRoom} style={{ marginBottom: '2rem' }}>
                {/* Room ID Input */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <input
                        type="text"
                        name="roomId"
                        placeholder="ROOM Id"
                        style={{
                            width: '100%',
                            padding: '1rem 1.25rem',
                            backgroundColor: '#4a5568',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: '500',
                            outline: 'none',
                            fontFamily: 'Space Grotesk, sans-serif',
                            boxSizing: 'border-box'
                        }}
                        onChange={handleInputChanges}
                        value={currentUser.roomId}
                    />
                </div>

                {/* Username Input */}
                <div style={{ marginBottom: '2rem' }}>
                    <input
                        type="text"
                        name="username"
                        placeholder="USERNAME"
                        style={{
                            width: '100%',
                            padding: '1rem 1.25rem',
                            backgroundColor: '#4a5568',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: '500',
                            outline: 'none',
                            fontFamily: 'Space Grotesk, sans-serif',
                            boxSizing: 'border-box'
                        }}
                        onChange={handleInputChanges}
                        value={currentUser.username}
                        ref={usernameRef}
                    />
                </div>

                {/* Join Button */}
                <button
                    type="submit"
                    disabled={status === USER_STATUS.ATTEMPTING_JOIN}
                    style={{
                        width: '100%',
                        padding: '1rem 1.5rem',
                        backgroundColor: status === USER_STATUS.ATTEMPTING_JOIN ? '#38a169' : '#48bb78',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '1.125rem',
                        fontWeight: 'bold',
                        cursor: status === USER_STATUS.ATTEMPTING_JOIN ? 'not-allowed' : 'pointer',
                        opacity: status === USER_STATUS.ATTEMPTING_JOIN ? 0.5 : 1,
                        fontFamily: 'Space Grotesk, sans-serif',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box'
                    }}
                    onMouseOver={(e) => {
                        if (!e.currentTarget.disabled) {
                            e.currentTarget.style.backgroundColor = '#38a169'
                        }
                    }}
                    onMouseOut={(e) => {
                        if (!e.currentTarget.disabled) {
                            e.currentTarget.style.backgroundColor = '#48bb78'
                        }
                    }}
                >
                    {status === USER_STATUS.ATTEMPTING_JOIN ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '1.25rem',
                                height: '1.25rem',
                                border: '2px solid #ffffff',
                                borderTop: '2px solid transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                            <span>Joining...</span>
                        </div>
                    ) : (
                        "Join"
                    )}
                </button>
            </form>

            {/* Generate Room ID Link */}
            <div style={{ textAlign: 'center' }}>
                <button
                    type="button"
                    style={{
                        color: '#d1d5db',
                        background: 'none',
                        border: 'none',
                        textDecoration: 'underline',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontFamily: 'Space Grotesk, sans-serif',
                        transition: 'color 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.color = '#ffffff'
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.color = '#d1d5db'
                    }}
                    onClick={createNewRoomId}
                >
                    Generate Unique Room ID
                </button>
            </div>
        </div>
    )
}

export default FormComponent
