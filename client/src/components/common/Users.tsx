import { useAppContext } from "@/context/AppContext"
import { RemoteUser, USER_CONNECTION_STATUS } from "@/types/user"
import { useSimpleVideoCall } from "@/context/SimpleVideoCallContext"
import { Video } from "lucide-react"
import ModernAvatar from "./ModernAvatar"
import { useInterview } from "@/context/InterviewContext"

// Function to get consistent avatar style for each user
const getAvatarStyle = (username: string): 'adventurer' | 'avataaars' | 'openPeeps' => {
    const styles: ('adventurer' | 'avataaars' | 'openPeeps')[] = ['adventurer', 'avataaars', 'openPeeps']
    
    // Generate hash from username for consistent style selection
    let hash = 0
    for (let i = 0; i < username.length; i++) {
        const char = username.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    
    const styleIndex = Math.abs(hash) % styles.length
    return styles[styleIndex]
}

function Users() {
    const { users } = useAppContext()

    return (
        <div className="vscode-users-list">
            {users.map((user) => {
                return <User key={user.socketId} user={user} />
            })}
        </div>
    )
}

const User = ({ user }: { user: RemoteUser }) => {
    const { username, status, socketId } = user
    const { currentUser } = useAppContext()
    const { startCall, isInCall } = useSimpleVideoCall()
    const { isInterviewMode, candidateSocketId } = useInterview()
    
    const handleVideoCall = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (status === USER_CONNECTION_STATUS.ONLINE && !isInCall) {
            console.log('Starting video call to:', username)
            startCall(socketId, username)
        }
    }
    
    const isCurrentUser = username === currentUser.username
    const canCall = status === USER_CONNECTION_STATUS.ONLINE && !isCurrentUser && !isInCall

    return (
        <div className="vscode-user-card">
            <div className="vscode-user-avatar-container">
                <ModernAvatar 
                    name={username} 
                    size={44} 
                    style={getAvatarStyle(username)}
                />
                <div
                    className={`vscode-user-status ${
                        status === USER_CONNECTION_STATUS.ONLINE ? "online" : "offline"
                    }`}
                />
                
                {/* Call Button - Top Right Corner - Always Visible */}
                {!isCurrentUser && (
                    <button
                        onClick={handleVideoCall}
                        className={`vscode-call-button-corner ${
                            status === USER_CONNECTION_STATUS.ONLINE ? 'online' : 'offline'
                        } ${isInCall ? 'disabled' : ''}`}
                        title={
                            status === USER_CONNECTION_STATUS.ONLINE && !isInCall
                                ? `Start video call with ${username}`
                                : status === USER_CONNECTION_STATUS.OFFLINE
                                ? `${username} is offline`
                                : `Already in a call`
                        }
                        disabled={!canCall}
                    >
                        <Video size={14} />
                    </button>
                )}
            </div>
            <span className="vscode-user-name">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div>
                        {username}
                        {!isInterviewMode && user.role && (
                            <span style={{
                                fontSize: '0.7em', color: '#aaaaaa', marginLeft: '5px',
                                padding: '2px 4px', background: '#333', borderRadius: '4px',
                                textTransform: 'uppercase'
                            }}>
                                {user.role}
                            </span>
                        )}
                    </div>
                    {isInterviewMode && (
                        <span style={{
                            fontSize: '0.7em', 
                            color: socketId === candidateSocketId ? '#F44336' : '#2196F3',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}>
                            {socketId === candidateSocketId ? 'Candidate' : 'Interviewer'}
                        </span>
                    )}
                </div>
            </span>
        </div>
    )
}

export default Users
