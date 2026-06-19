import { useAppContext } from "@/context/AppContext"
import { useViews } from "@/context/ViewContext"
import { ACTIVITY_STATE } from "@/types/app"
import DrawingEditor from "../drawing/DrawingEditor"
import EditorComponent from "../editor/EditorComponent"
import SidebarPanel from "../SidebarPanel"
import TerminalPanel from "../terminal/TerminalPanel"

interface WorkSpaceProps {
    isTerminalOpen?: boolean
    onToggleTerminal?: () => void
}

function WorkSpace({ isTerminalOpen = false, onToggleTerminal }: WorkSpaceProps) {
    const { activityState } = useAppContext()
    const { isSidebarOpen, activeView } = useViews()
    const terminalHeight = 300

    const getViewTitle = (view: string) => {
        switch(view) {
            case 'FILES': return 'Files'
            case 'CHATS': return 'Chat'
            case 'COPILOT': return 'Copilot'
            case 'RUN': return 'Run and Debug'
            case 'CLIENTS': return 'Live Share'
            case 'SETTINGS': return 'Settings'
            case 'REVIEW': return 'AI Review'
            default: return 'Files'
        }
    }

    return (
        <>
            {/* Sidebar Panel (File Explorer, etc.) */}
            {isSidebarOpen && (
                <div className="vscode-sidebar">
                    <div className="vscode-sidebar-header">
                        <span className="vscode-sidebar-title">{getViewTitle(activeView)}</span>
                    </div>
                    <div className="vscode-sidebar-content">
                        <SidebarPanel />
                    </div>
                </div>
            )}
            
            {/* Main Editor Area */}
            <div className="vscode-editor-area">
                {/* Editor Content */}
                <div className="vscode-editor-content" style={{ height: isTerminalOpen ? `calc(100% - ${terminalHeight}px)` : '100%' }}>
                    {activityState === ACTIVITY_STATE.DRAWING ? (
                        <DrawingEditor />
                    ) : (
                        <EditorComponent />
                    )}
                </div>
                
                {/* Terminal Panel */}
                {isTerminalOpen && (
                    <>
                        <div className="vscode-resize-handle" />
                        <div className="vscode-terminal" style={{ height: `${terminalHeight}px` }}>
                            <TerminalPanel 
                                onClose={onToggleTerminal || (() => {})}
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    )
}

export default WorkSpace
