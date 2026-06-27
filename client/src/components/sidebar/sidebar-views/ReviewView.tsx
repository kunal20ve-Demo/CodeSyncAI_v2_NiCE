import { useState } from "react"
import { useFileSystem } from "@/context/FileContext"
import { useSettings } from "@/context/SettingContext"
import useResponsive from "@/hooks/useResponsive"
import toast from "react-hot-toast"
import { Activity, Loader2, CheckCircle, AlertTriangle, Lightbulb } from "lucide-react"
import { getBackendUrl } from "@/utils/backendUrl"

enum ReviewStatus {
    IDLE = "IDLE",
    LOADING = "LOADING",
    SUCCESS = "SUCCESS",
    ERROR = "ERROR",
}

export default function ReviewView() {
    const { viewHeight } = useResponsive()
    const { activeFile, openFiles } = useFileSystem()
    const { openAIApiKey } = useSettings()

    const [status, setStatus] = useState<ReviewStatus>(ReviewStatus.IDLE)
    const [reviewData, setReviewData] = useState<any>(null)
    const [selectedFileId, setSelectedFileId] = useState<string>("")

    const handleAnalyze = async () => {
        const fileToAnalyze = openFiles.find(f => f.id === selectedFileId) || activeFile;
        if (!fileToAnalyze || !fileToAnalyze.content) {
            toast.error("Please select a file with code to analyze.")
            return
        }

        setStatus(ReviewStatus.LOADING)
        setReviewData(null)
        toast.loading(`Analyzing ${fileToAnalyze.name}...`, { id: "analyze" })

        try {
            const BACKEND_URL = getBackendUrl()
            const response = await fetch(`${BACKEND_URL}/api/analyze-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    code: fileToAnalyze.content,
                    apiKey: openAIApiKey || ""
                })
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || "Failed to analyze code")
            }

            setReviewData(data)
            setStatus(ReviewStatus.SUCCESS)
            toast.success("Analysis complete", { id: "analyze" })
        } catch (error: any) {
            console.error(error)
            setStatus(ReviewStatus.ERROR)
            toast.error(error.message || "Failed to analyze code", { id: "analyze" })
        }
    }

    return (
        <div className="vscode-copilot" style={{ height: viewHeight }}>
            {/* Header */}
            <div className="vscode-copilot-header">
                <div className="vscode-copilot-icon-badge">
                    <Activity className="vscode-copilot-icon" />
                </div>
                <div className="vscode-copilot-title">
                    <h1>AI Review</h1>
                    <p>Analyze code quality</p>
                </div>
            </div>

            <div className="vscode-copilot-content" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "15px", overflowY: "auto" }}>
                <p style={{ color: "var(--text-color)", fontSize: "0.95rem" }}>
                    Select a file and click the button below to get AI-powered code analysis.
                    It will check for bugs, optimization opportunities, and readability.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "0.85rem", color: "#aaa" }}>File to Analyze</label>
                    <select 
                        style={{
                            width: "100%",
                            padding: "8px",
                            backgroundColor: "var(--dark-hover)",
                            border: "1px solid var(--border-color)",
                            color: "var(--text-color)",
                            borderRadius: "4px",
                            outline: "none"
                        }}
                        value={selectedFileId || activeFile?.id || ""}
                        onChange={(e) => setSelectedFileId(e.target.value)}
                    >
                        {openFiles.length === 0 && <option value="">No files open</option>}
                        {openFiles.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    className="vscode-copilot-generate-btn"
                    onClick={handleAnalyze}
                    disabled={status === ReviewStatus.LOADING || openFiles.length === 0}
                    style={{ marginTop: "10px" }}
                >
                    {status === ReviewStatus.LOADING ? (
                        <>
                            <Loader2 className="spin" style={{ width: '16px', height: '16px' }} />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Activity style={{ width: '16px', height: '16px' }} />
                            Analyze File
                        </>
                    )}
                </button>

                {reviewData && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                        {/* Score */}
                        <div style={{ background: 'var(--dark-hover)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold' }}>Quality Score</span>
                            <span style={{ 
                                fontSize: '1.5rem', 
                                fontWeight: 'bold', 
                                color: reviewData.score > 80 ? '#4CAF50' : reviewData.score > 50 ? '#FFC107' : '#F44336' 
                            }}>
                                {reviewData.score} / 100
                            </span>
                        </div>

                        {/* Bugs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1rem', color: '#F44336' }}>
                                <AlertTriangle size={18} />
                                Issues & Bugs ({reviewData.bugs?.length || 0})
                            </h3>
                            {reviewData.bugs?.length > 0 ? (
                                <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-color)' }}>
                                    {reviewData.bugs.map((bug: string, i: number) => (
                                        <li key={i} style={{ marginBottom: '5px' }}>{bug}</li>
                                    ))}
                                </ul>
                            ) : (
                                <span style={{ color: '#aaa', fontSize: '0.9rem' }}>No bugs found! Great job.</span>
                            )}
                        </div>

                        {/* Optimizations */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1rem', color: '#2196F3' }}>
                                <CheckCircle size={18} />
                                Optimizations ({reviewData.optimizationSuggestions?.length || 0})
                            </h3>
                            {reviewData.optimizationSuggestions?.length > 0 ? (
                                <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-color)' }}>
                                    {reviewData.optimizationSuggestions.map((opt: string, i: number) => (
                                        <li key={i} style={{ marginBottom: '5px' }}>{opt}</li>
                                    ))}
                                </ul>
                            ) : (
                                <span style={{ color: '#aaa', fontSize: '0.9rem' }}>No major optimization suggestions.</span>
                            )}
                        </div>

                        {/* Readability */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1rem', color: '#FFC107' }}>
                                <Lightbulb size={18} />
                                Readability Feedback
                            </h3>
                            <p style={{ margin: 0, color: 'var(--text-color)', lineHeight: 1.5, fontSize: '0.95rem' }}>
                                {reviewData.readabilityFeedback || "Code is reasonably readable."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
