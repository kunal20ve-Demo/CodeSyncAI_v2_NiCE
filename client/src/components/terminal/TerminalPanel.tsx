import { useState, useRef, useEffect } from "react"
import { IoClose, IoTerminal } from "react-icons/io5"
import { VscClearAll } from "react-icons/vsc"

interface TerminalPanelProps {
    onClose: () => void
    onResize: (height: number) => void
}

function TerminalPanel({ onClose, onResize }: TerminalPanelProps) {
    const [output, setOutput] = useState<string[]>([
        "Welcome to Code Sync Terminal",
        "Type 'help' for available commands",
        ""
    ])
    const [input, setInput] = useState("")
    const [history, setHistory] = useState<string[]>([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const outputRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [isResizing, setIsResizing] = useState(false)
    const [startY, setStartY] = useState(0)
    const [startHeight, setStartHeight] = useState(300)

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight
        }
    }, [output])

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [])

    const handleCommand = (command: string) => {
        const trimmedCommand = command.trim()
        if (!trimmedCommand) return

        // Add command to history
        setHistory(prev => [...prev, trimmedCommand])
        setHistoryIndex(-1)

        // Add command to output
        setOutput(prev => [...prev, `$ ${trimmedCommand}`])

        // Process command
        switch (trimmedCommand.toLowerCase()) {
            case 'help':
                setOutput(prev => [...prev, 
                    "Available commands:",
                    "  help     - Show this help message",
                    "  clear    - Clear terminal output",
                    "  echo     - Echo text",
                    "  date     - Show current date",
                    "  whoami   - Show current user",
                    ""
                ])
                break
            case 'clear':
                setOutput([])
                break
            case 'date':
                setOutput(prev => [...prev, new Date().toString(), ""])
                break
            case 'whoami':
                setOutput(prev => [...prev, "code-sync-user", ""])
                break
            default:
                if (trimmedCommand.startsWith('echo ')) {
                    const text = trimmedCommand.substring(5)
                    setOutput(prev => [...prev, text, ""])
                } else {
                    setOutput(prev => [...prev, `Command not found: ${trimmedCommand}`, ""])
                }
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleCommand(input)
            setInput("")
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            if (history.length > 0) {
                const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
                setHistoryIndex(newIndex)
                setInput(history[newIndex])
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            if (historyIndex !== -1) {
                const newIndex = historyIndex + 1
                if (newIndex >= history.length) {
                    setHistoryIndex(-1)
                    setInput("")
                } else {
                    setHistoryIndex(newIndex)
                    setInput(history[newIndex])
                }
            }
        }
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsResizing(true)
        setStartY(e.clientY)
        setStartHeight(300) // Current height
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing) return
        const deltaY = startY - e.clientY
        const newHeight = Math.max(100, Math.min(600, startHeight + deltaY))
        onResize(newHeight)
    }

    const handleMouseUp = () => {
        setIsResizing(false)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
    }

    const clearOutput = () => {
        setOutput([])
    }

    return (
        <>
            <div className="vscode-terminal-header">
                <div className="vscode-terminal-title">
                    <IoTerminal size={16} />
                    <span>Terminal</span>
                </div>
                <div className="vscode-terminal-actions">
                    <div className="vscode-terminal-action" onClick={clearOutput} title="Clear Terminal">
                        <VscClearAll size={16} />
                    </div>
                    <div className="vscode-terminal-action" onClick={onClose} title="Close Terminal">
                        <IoClose size={16} />
                    </div>
                </div>
            </div>

            <div className="vscode-terminal-content" ref={outputRef}>
                {output.map((line, index) => (
                    <div key={index} style={{ whiteSpace: 'pre-wrap' }}>
                        {line}
                    </div>
                ))}
            </div>

            <div className="vscode-terminal-input">
                <span className="vscode-terminal-prompt">$</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a command..."
                />
            </div>
        </>
    )
}

export default TerminalPanel
