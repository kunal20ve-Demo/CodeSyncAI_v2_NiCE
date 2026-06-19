import { useFileSystem } from "@/context/FileContext"
import { useSettings } from "@/context/SettingContext"
import { useAppContext } from "@/context/AppContext"
import { IoGitBranch, IoCheckmarkCircle, IoTerminal } from "react-icons/io5"
import { VscError, VscWarning } from "react-icons/vsc"

interface StatusBarProps {
    onToggleTerminal?: () => void
    isTerminalOpen?: boolean
}

function StatusBar({ onToggleTerminal, isTerminalOpen = false }: StatusBarProps) {
    const { activeFile } = useFileSystem()
    const { language, fontSize } = useSettings()
    const { users } = useAppContext()

    const getFileExtension = (filename: string) => {
        return filename.split('.').pop()?.toUpperCase() || 'TXT'
    }

    const getLineEnding = () => 'LF' // Default to LF for web
    const getEncoding = () => 'UTF-8'

    return (
        <>
            <div className="vscode-status-left">
                <div className="vscode-status-item">
                    <IoGitBranch size={12} />
                    <span>main</span>
                </div>
                <div className="vscode-status-item">
                    <VscError size={12} />
                    <span>0</span>
                </div>
                <div className="vscode-status-item">
                    <VscWarning size={12} />
                    <span>0</span>
                </div>
                <div className="vscode-status-item">
                    <IoCheckmarkCircle size={12} />
                    <span>{users.length} connected</span>
                </div>
            </div>

            <div className="vscode-status-right">
                {activeFile && (
                    <>
                        <div className="vscode-status-item">Ln 1, Col 1</div>
                        <div className="vscode-status-item">{getFileExtension(activeFile.name)}</div>
                        <div className="vscode-status-item">{getEncoding()}</div>
                        <div className="vscode-status-item">{getLineEnding()}</div>
                    </>
                )}
                <div className="vscode-status-item">{language}</div>
                <div className="vscode-status-item">{fontSize}px</div>
                {onToggleTerminal && (
                    <div 
                        className={`vscode-status-item ${isTerminalOpen ? 'active' : ''}`}
                        onClick={onToggleTerminal}
                    >
                        <IoTerminal size={12} />
                        <span>Terminal</span>
                    </div>
                )}
                <div className="vscode-status-item">
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#4ec9b0', borderRadius: '50%' }}></div>
                    <span>Live</span>
                </div>
            </div>
        </>
    )
}

export default StatusBar
