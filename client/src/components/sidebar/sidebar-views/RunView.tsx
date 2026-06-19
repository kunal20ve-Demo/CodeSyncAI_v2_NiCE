import { useRunCode } from "@/context/RunCodeContext"
import useResponsive from "@/hooks/useResponsive"
import { ChangeEvent } from "react"
import toast from "react-hot-toast"
import { Copy, ChevronDown, Play, Terminal, Loader2 } from "lucide-react"

function RunView() {
    const { viewHeight } = useResponsive()
    const {
        setInput,
        output,
        isRunning,
        supportedLanguages,
        selectedLanguage,
        setSelectedLanguage,
        runCode,
    } = useRunCode()

    const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const lang = JSON.parse(e.target.value)
        setSelectedLanguage(lang)
    }

    const copyOutput = () => {
        navigator.clipboard.writeText(output)
        toast.success("Output copied to clipboard")
    }

    return (
        <div className="vscode-run-debug" style={{ height: viewHeight }}>
            {/* Header */}
            <div className="vscode-run-header">
                <div className="vscode-run-icon-badge">
                    <Terminal className="vscode-run-icon" />
                </div>
                <div className="vscode-run-title">
                    <h1>Run & Debug</h1>
                    <p>Execute code in multiple languages</p>
                </div>
            </div>
            
            {/* Content */}
            <div className="vscode-run-content">
                {/* Language Selector */}
                <div className="vscode-language-selector">
                    <select
                        className="vscode-language-select"
                        value={JSON.stringify(selectedLanguage)}
                        onChange={handleLanguageChange}
                    >
                        {supportedLanguages
                            .sort((a, b) => (a.language > b.language ? 1 : -1))
                            .map((lang, i) => {
                                return (
                                    <option
                                        key={i}
                                        value={JSON.stringify(lang)}
                                    >
                                        {lang.language +
                                            (lang.version
                                                ? ` (${lang.version})`
                                                : "")}
                                    </option>
                                )
                            })}
                    </select>
                    <ChevronDown className="vscode-language-chevron" />
                </div>
                
                {/* Code Input */}
                <textarea
                    className="vscode-code-input"
                    placeholder="Write your input here..."
                    onChange={(e) => setInput(e.target.value)}
                />
                
                {/* Run Button */}
                <button
                    className="vscode-run-btn"
                    onClick={runCode}
                    disabled={isRunning}
                >
                    {isRunning ? (
                        <>
                            <Loader2 className="spin" style={{ width: '16px', height: '16px' }} />
                            Running...
                        </>
                    ) : (
                        <>
                            <Play style={{ width: '16px', height: '16px' }} />
                            Run Code
                        </>
                    )}
                </button>
                
                {/* Output Section */}
                <div className="vscode-output-section">
                    <div className="vscode-output-header">
                        <label className="vscode-output-label">Output</label>
                        <button 
                            onClick={copyOutput} 
                            title="Copy Output"
                            className="vscode-output-copy-btn"
                        >
                            <Copy style={{ width: '16px', height: '16px' }} />
                        </button>
                    </div>
                    
                    {/* Output Display */}
                    <div className="vscode-output-display">
                        {output || "No output yet..."}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RunView
