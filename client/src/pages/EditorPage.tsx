
import ConnectionStatusPage from "@/components/connection/ConnectionStatusPage"
import Sidebar from "@/components/sidebar/Sidebar"
import WorkSpace from "@/components/workspace"
import StatusBar from "@/components/StatusBar"
import SimpleVideoCallModal from "@/components/video/SimpleVideoCallModal"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { SimpleVideoCallProvider } from "@/context/SimpleVideoCallContext"
import useFullScreen from "@/hooks/useFullScreen"
import useUserActivity from "@/hooks/useUserActivity"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS, User } from "@/types/user"
import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

function EditorPage() {
    // Listen user online/offline status
    useUserActivity()
    // Enable fullscreen mode
    useFullScreen()
    const navigate = useNavigate()
    const { roomId } = useParams()
    const { status, setCurrentUser, currentUser } = useAppContext()
    const { socket } = useSocket()
    const location = useLocation()
    const [isTerminalOpen, setIsTerminalOpen] = useState(false)

    useEffect(() => {
        if (currentUser.username.length > 0) return
        const username = location.state?.username
        if (username === undefined) {
            navigate("/", {
                state: { roomId },
            })
        } else if (roomId) {
            const user: User = { username, roomId }
            setCurrentUser(user)
            socket.emit(SocketEvent.JOIN_REQUEST, user)
        }
    }, [
        currentUser.username,
        location.state?.username,
        navigate,
        roomId,
        setCurrentUser,
        socket,
    ])

    if (status === USER_STATUS.CONNECTION_FAILED) {
        return <ConnectionStatusPage />
    }

    return (
        <SimpleVideoCallProvider>
            {status === USER_STATUS.ATTEMPTING_JOIN ||
            status === USER_STATUS.CONNECTION_FAILED ? (
                <ConnectionStatusPage />
            ) : (
                <div className="vscode-container">
                    <div className="vscode-main">
                        {/* Activity Bar */}
                        <div className="vscode-activity-bar">
                            <Sidebar />
                        </div>
                        
                        {/* Main Content Area */}
                        <WorkSpace 
                            isTerminalOpen={isTerminalOpen}
                            onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
                        />
                    </div>
                    
                    {/* Status Bar */}
                    <div className="vscode-status-bar">
                        <StatusBar 
                            onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
                            isTerminalOpen={isTerminalOpen}
                            setIsTerminalOpen={setIsTerminalOpen}
                        />
                    </div>
                </div>
            )}
            <SimpleVideoCallModal />
        </SimpleVideoCallProvider>
    )
}

export default EditorPage
