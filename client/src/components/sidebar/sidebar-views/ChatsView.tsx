import ChatInput from "@/components/chats/ChatInput"
import ChatList from "@/components/chats/ChatList"
import useResponsive from "@/hooks/useResponsive"
import { MessageSquare, Users } from "lucide-react"

const ChatsView = () => {
    const { viewHeight } = useResponsive()

    return (
        <div className="vscode-group-chat" style={{ height: viewHeight }}>
            {/* Header */}
            <div className="vscode-chat-header">
                <div className="vscode-chat-icon-badge">
                    <MessageSquare className="vscode-chat-icon" />
                </div>
                <div className="vscode-chat-title">
                    <h1>Group Chat</h1>
                    <p>Collaborate with your team</p>
                </div>
                <Users className="vscode-chat-users-icon" />
            </div>
            
            {/* Chat content */}
            <div className="vscode-chat-content">
                {/* Chat list */}
                <ChatList />
                {/* Chat input */}
                <ChatInput />
            </div>
        </div>
    )
}

export default ChatsView
