import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { useViews } from "@/context/ViewContext"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { ACTIVITY_STATE } from "@/types/app"
import { SocketEvent } from "@/types/socket"
import { VIEWS } from "@/types/view"
import { Code2, PenTool } from "lucide-react"
import { Tooltip } from 'react-tooltip'
import { useState } from 'react'
import { tooltipStyles } from "./tooltipStyles"

function Sidebar() {
    const {
        viewIcons,
        isSidebarOpen,
        setIsSidebarOpen,
    } = useViews()
    const { activityState, setActivityState } = useAppContext()
    const { socket } = useSocket()
    const { isMobile } = useWindowDimensions()
    const [showTooltip, setShowTooltip] = useState(true)

    const changeState = () => {
        setShowTooltip(false)
        if (activityState === ACTIVITY_STATE.CODING) {
            setActivityState(ACTIVITY_STATE.DRAWING)
            socket.emit(SocketEvent.REQUEST_DRAWING)
        } else {
            setActivityState(ACTIVITY_STATE.CODING)
        }

        if (isMobile) {
            setIsSidebarOpen(false)
        }
    }

    const { activeView, setActiveView } = useViews()

    const handleViewClick = (view: VIEWS) => {
        if (activeView === view && isSidebarOpen) {
            setIsSidebarOpen(false)
        } else {
            setActiveView(view)
            setIsSidebarOpen(true)
        }
    }

    const sidebarItems = [
        { view: VIEWS.FILES, label: 'Explorer', shortcut: 'Ctrl+Shift+E' },
        { view: VIEWS.CHATS, label: 'Group Chat', shortcut: 'Ctrl+Shift+C' },
        { view: VIEWS.COPILOT, label: 'ChatGPT', shortcut: 'Ctrl+Shift+A' },
        { view: VIEWS.REVIEW, label: 'AI Review', shortcut: 'Ctrl+Shift+R' },
        { view: VIEWS.RUN, label: 'Run & Debug', shortcut: 'Ctrl+Shift+D' },
        { view: VIEWS.CLIENTS, label: 'Live Share', shortcut: 'Ctrl+Shift+L' },
        { view: VIEWS.SETTINGS, label: 'Settings', shortcut: 'Ctrl+,' },
    ]

    return (
        <>
            {sidebarItems.map(({ view, label, shortcut }) => (
                <div
                    key={view}
                    className={`vscode-activity-item ${activeView === view && isSidebarOpen ? 'active' : ''}`}
                    onClick={() => handleViewClick(view)}
                    data-tooltip-id="sidebar-tooltip"
                    data-tooltip-content={`${label} (${shortcut})`}
                    data-tooltip-place="right"
                >
                    {viewIcons[view]}
                </div>
            ))}
            
            {/* Activity state toggle at bottom */}
            <div 
                className="vscode-activity-item" 
                style={{ marginTop: 'auto' }} 
                onClick={changeState}
                data-tooltip-id="activity-state-tooltip"
                data-tooltip-content={activityState === ACTIVITY_STATE.CODING ? "Switch to Drawing" : "Switch to Coding"}
            >
                {activityState === ACTIVITY_STATE.CODING ? (
                    <PenTool size={20} strokeWidth={1.5} />
                ) : (
                    <Code2 size={20} strokeWidth={1.5} />
                )}
            </div>
            
            {/* Tooltips */}
            <Tooltip
                id="sidebar-tooltip"
                place="right"
                offset={15}
                style={tooltipStyles}
                noArrow={false}
                positionStrategy="fixed"
                float={true}
            />
            {showTooltip && (
                <Tooltip
                    id="activity-state-tooltip"
                    place="right"
                    offset={15}
                    style={tooltipStyles}
                    noArrow={false}
                    positionStrategy="fixed"
                    float={true}
                />
            )}
        </>
    )
}

export default Sidebar
