import Users from "@/components/common/Users"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import useResponsive from "@/hooks/useResponsive"
import { USER_STATUS } from "@/types/user"
import toast from "react-hot-toast"
import { Share2, Copy, LogOut, Users as UsersIcon, Link, Activity } from "lucide-react"
import { useNavigate } from "react-router-dom"
import SidebarVideoCall from '../../video/SidebarVideoCall'
import AnalyticsModal from '../../workspace/AnalyticsModal'
import { useState, useEffect } from "react"
import { useInterview } from "@/context/InterviewContext"
import { USER_ROLE } from "@/types/user"

function UsersView() {
    const navigate = useNavigate()
    const { viewHeight } = useResponsive()
    const { currentUser, users, setStatus } = useAppContext()
    const { socket } = useSocket()
    const { isInterviewMode, startInterview, endInterview, timerEndTime } = useInterview()
    
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)
    const [analyticsData, setAnalyticsData] = useState([])
    const [candidateId, setCandidateId] = useState("")
    const [duration, setDuration] = useState(30)
    const [timeLeft, setTimeLeft] = useState<string>("")

    useEffect(() => {
        const handleAnalyticsResponse = (data: any) => {
            setAnalyticsData(data)
        }
        socket.on("analytics-updated", handleAnalyticsResponse)
        return () => {
            socket.off("analytics-updated", handleAnalyticsResponse)
        }
    }, [socket])
    useEffect(() => {
        let timer: NodeJS.Timeout
        if (isInterviewMode && timerEndTime) {
            timer = setInterval(() => {
                const now = Date.now()
                const diff = timerEndTime - now
                if (diff <= 0) {
                    setTimeLeft("00:00")
                    clearInterval(timer)
                } else {
                    const m = Math.floor(diff / 60000)
                    const s = Math.floor((diff % 60000) / 1000)
                    setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
                }
            }, 1000)
        } else {
            setTimeLeft("")
        }
        return () => clearInterval(timer)
    }, [isInterviewMode, timerEndTime])
    const openAnalytics = () => {
        socket.emit("get-analytics", { roomId: currentUser.roomId })
        setIsAnalyticsOpen(true)
    }

    const copyURL = async () => {
        const url = window.location.href
        try {
            await navigator.clipboard.writeText(url)
            toast.success("URL copied to clipboard")
        } catch (error) {
            toast.error("Unable to copy URL to clipboard")
            console.log(error)
        }
    }

    const shareURL = async () => {
        const url = window.location.href
        try {
            await navigator.share({ url })
        } catch (error) {
            toast.error("Unable to share URL")
            console.log(error)
        }
    }

    const leaveRoom = () => {
        socket.disconnect()
        setStatus(USER_STATUS.DISCONNECTED)
        navigate("/", {
            replace: true,
        })
    }

    return (
        <div className="vscode-live-share" style={{ height: viewHeight }}>
            {/* Header */}
            <div className="vscode-live-header">
                <div className="vscode-live-icon-badge">
                    <UsersIcon className="vscode-live-icon" />
                </div>
                <div className="vscode-live-title">
                    <h1>Live Share</h1>
                    <p>Collaborate with your team</p>
                </div>
                <Link className="vscode-live-indicator" />
            </div>
            
            {/* Content */}
            <div className="vscode-live-content">
                {/* Sidebar Video Call Component */}
                <SidebarVideoCall />
                
                {/* List of connected users */}
                <div className="vscode-users-list">
                    <Users />
                </div>
                
                {/* Action Buttons */}
                <div className="vscode-live-actions">
                    {/* Share URL button */}
                    <button
                        className="vscode-live-action-btn primary"
                        onClick={shareURL}
                        title="Share Link"
                    >
                        <Share2 style={{ width: '16px', height: '16px' }} />
                        <span>Share</span>
                    </button>
                    
                    {/* Copy URL button */}
                    <button
                        className="vscode-live-action-btn secondary"
                        onClick={copyURL}
                        title="Copy Link"
                    >
                        <Copy style={{ width: '16px', height: '16px' }} />
                        <span>Copy</span>
                    </button>
                </div>

                {/* Interview Mode section */}
                {currentUser?.role === USER_ROLE.ADMIN && (
                    <div style={{ marginTop: '15px', padding: '15px', background: 'var(--dark-hover)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: 'var(--text-color)' }}>Interview Mode</h3>
                        {!isInterviewMode ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <select 
                                    className="vscode-settings-select" 
                                    value={candidateId} 
                                    onChange={(e) => setCandidateId(e.target.value)}
                                    style={{ 
                                        width: '100%', 
                                        padding: '6px', 
                                        background: 'var(--dark-hover)', 
                                        border: '1px solid var(--border-color)', 
                                        color: '#eee', 
                                        borderRadius: '4px'
                                    }}
                                >
                                    <option value="">Select Candidate...</option>
                                    {users.filter(u => u.socketId !== socket.id).map(u => (
                                        <option key={u.socketId} value={u.socketId}>{u.username}</option>
                                    ))}
                                </select>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label style={{ color: '#aaa', fontSize: '0.8rem' }}>Mins:</label>
                                    <input 
                                        type="number" 
                                        className="vscode-settings-input" 
                                        value={duration} 
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                        style={{ 
                                            width: '60px',
                                            padding: '6px', 
                                            background: 'var(--dark-hover)', 
                                            border: '1px solid var(--border-color)', 
                                            color: '#eee', 
                                            borderRadius: '4px'
                                        }}
                                    />
                                    <button 
                                        className="vscode-live-action-btn primary"
                                        onClick={() => candidateId ? startInterview(candidateId, duration) : toast.error("Select a candidate")}
                                        style={{ flex: 1 }}
                                    >
                                        Start
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#F44336' }}>
                                    {timeLeft}
                                </div>
                                <button 
                                    className="vscode-live-leave-btn"
                                    onClick={endInterview}
                                >
                                    Stop Interview
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
                {currentUser?.role !== USER_ROLE.ADMIN && isInterviewMode && (
                    <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(244, 67, 54, 0.1)', borderRadius: '8px', border: '1px solid #F44336', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 5px 0', color: '#F44336' }}>Interview Active</h3>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#F44336' }}>
                            {timeLeft}
                        </div>
                    </div>
                )}
                
                {/* Analytics button */}
                <button
                    className="vscode-live-leave-btn"
                    onClick={openAnalytics}
                    title="View Analytics"
                    style={{ marginTop: '15px', marginBottom: '10px', backgroundColor: '#333', color: '#fff' }}
                >
                    <Activity style={{ width: '16px', height: '16px' }} />
                    <span>Analytics Dashboard</span>
                </button>

                {/* Leave room button */}
                <button
                    className="vscode-live-leave-btn"
                    onClick={leaveRoom}
                    title="Leave room"
                >
                    <LogOut style={{ width: '16px', height: '16px' }} />
                    <span>Leave Room</span>
                </button>
            </div>
            
            {isAnalyticsOpen && (
                <AnalyticsModal 
                    data={analyticsData} 
                    onClose={() => setIsAnalyticsOpen(false)} 
                />
            )}
        </div>
    )
}

export default UsersView
