import { X, Activity, Code, Clock, FileEdit } from "lucide-react"

interface AnalyticsData {
    username: string
    role?: string
    linesOfCode: number
    activeTime: number
    numberOfEdits: number
    fileContributions: number
}

interface AnalyticsModalProps {
    data: AnalyticsData[]
    onClose: () => void
}

export default function AnalyticsModal({ data, onClose }: AnalyticsModalProps) {
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = Math.floor(seconds % 60)
        return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`
    }

    const maxLOC = Math.max(1, ...data.map(d => d.linesOfCode))
    const maxEdits = Math.max(1, ...data.map(d => d.numberOfEdits))
    const maxFiles = Math.max(1, ...data.map(d => d.fileContributions))
    const maxTime = Math.max(1, ...data.map(d => d.activeTime))

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: '#1e1e2e', color: '#fff', borderRadius: '12px',
                padding: '24px', width: '90%', maxWidth: '900px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)', border: '1px solid #333',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
                        <Activity size={26} color="#00E5FF" />
                        Live Analytics
                    </h2>
                    <button 
                        onClick={onClose}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '50%', padding: '6px', display: 'flex' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ display: 'grid', gap: '15px' }}>
                    {data.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#888' }}>No active data available.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {data.map((user) => (
                                <div key={user.username} style={{ background: '#252535', borderRadius: '10px', padding: '16px', border: '1px solid #3a3a4c' }}>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{user.username}</h3>
                                            {user.role && (
                                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                                    {user.role}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#a0a0b0', fontSize: '0.9rem' }}>
                                            <Clock size={14} />
                                            Active for {formatTime(user.activeTime)}
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
                                        
                                        {/* LOC Bar */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                <span style={{ color: '#a0a0b0', display: 'flex', alignItems: 'center', gap: '4px' }}><Code size={12}/> LOC</span>
                                                <span style={{ fontWeight: 'bold' }}>{user.linesOfCode}</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(user.linesOfCode / maxLOC) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #4CAF50, #81C784)', borderRadius: '4px', transition: 'width 0.5s ease-out' }} />
                                            </div>
                                        </div>

                                        {/* Edits Bar */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                <span style={{ color: '#a0a0b0', display: 'flex', alignItems: 'center', gap: '4px' }}><FileEdit size={12}/> Edits</span>
                                                <span style={{ fontWeight: 'bold' }}>{user.numberOfEdits}</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(user.numberOfEdits / maxEdits) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #2196F3, #64B5F6)', borderRadius: '4px', transition: 'width 0.5s ease-out' }} />
                                            </div>
                                        </div>

                                        {/* Files Bar */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                <span style={{ color: '#a0a0b0', display: 'flex', alignItems: 'center', gap: '4px' }}>Files</span>
                                                <span style={{ fontWeight: 'bold' }}>{user.fileContributions}</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(user.fileContributions / maxFiles) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #FFC107, #FFD54F)', borderRadius: '4px', transition: 'width 0.5s ease-out' }} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
