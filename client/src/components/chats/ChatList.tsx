import { useAppContext } from "@/context/AppContext"
import { useChatRoom } from "@/context/ChatContext"
import { MessageSquare } from "lucide-react"
import { SyntheticEvent, useEffect, useRef } from "react"

// Function to generate consistent colors for usernames
const getUsernameColor = (username: string): string => {
    const colors = [
        '#3b82f6', // Blue
        '#10b981', // Green
        '#f59e0b', // Yellow
        '#ef4444', // Red
        '#8b5cf6', // Purple
        '#06b6d4', // Cyan
        '#f97316', // Orange
        '#84cc16', // Lime
        '#ec4899', // Pink
        '#6366f1', // Indigo
        '#14b8a6', // Teal
        '#f43f5e', // Rose
    ]
    
    // Generate a hash from the username
    let hash = 0
    for (let i = 0; i < username.length; i++) {
        const char = username.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
    }
    
    // Use the hash to select a color
    const colorIndex = Math.abs(hash) % colors.length
    return colors[colorIndex]
}

function ChatList() {
    const {
        messages,
        isNewMessage,
        setIsNewMessage,
        lastScrollHeight,
        setLastScrollHeight,
    } = useChatRoom()
    const { currentUser } = useAppContext()
    const messagesContainerRef = useRef<HTMLDivElement | null>(null)

    const handleScroll = (e: SyntheticEvent) => {
        const container = e.target as HTMLDivElement
        setLastScrollHeight(container.scrollTop)
    }

    // Scroll to bottom when messages change
    useEffect(() => {
        if (!messagesContainerRef.current) return
        messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight
    }, [messages])

    useEffect(() => {
        if (isNewMessage) {
            setIsNewMessage(false)
        }
        if (messagesContainerRef.current)
            messagesContainerRef.current.scrollTop = lastScrollHeight
    }, [isNewMessage, setIsNewMessage, lastScrollHeight])

    return (
        <div
            className="vscode-chat-messages"
            ref={messagesContainerRef}
            onScroll={handleScroll}
        >
            {/* Chat messages */}
            {messages.length === 0 ? (
                <div className="vscode-chat-empty">
                    <MessageSquare className="vscode-chat-empty-icon" />
                    <p>No messages yet. Start the conversation!</p>
                </div>
            ) : (
                messages.map((message, index) => {
                    const isOwnMessage = message.username === currentUser.username
                    return (
                        <div
                            key={index}
                            className={`vscode-chat-message${isOwnMessage ? ' own' : ''}`}
                        >
                            <div className="vscode-message-header">
                                <span 
                                    className="vscode-message-username"
                                    style={{ color: getUsernameColor(message.username) }}
                                >
                                    {message.username}
                                </span>
                                <span className="vscode-message-timestamp">
                                    {message.timestamp}
                                </span>
                            </div>
                            <p className="vscode-message-content">{message.message}</p>
                        </div>
                    )
                })
            )}
        </div>
    )
}

export default ChatList
