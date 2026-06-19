import { ReactNode, createContext, useContext, useEffect, useState } from "react"
import { useSocket } from "./SocketContext"
import { useAppContext } from "./AppContext"
import { IInterviewContext } from "@/types/interview"
import { SocketEvent } from "@/types/socket"
import toast from "react-hot-toast"

const InterviewContext = createContext<IInterviewContext | null>(null)

export const useInterview = () => {
    const context = useContext(InterviewContext)
    if (!context) {
        throw new Error("useInterview must be used within an InterviewContextProvider")
    }
    return context
}

export function InterviewContextProvider({ children }: { children: ReactNode }) {
    const { socket } = useSocket()
    const { currentUser } = useAppContext()

    const [isInterviewMode, setIsInterviewMode] = useState(false)
    const [candidateSocketId, setCandidateSocketId] = useState<string | null>(null)
    const [timerEndTime, setTimerEndTime] = useState<number | null>(null)

    const startInterview = (candidateId: string, durationMinutes: number) => {
        socket.emit(SocketEvent.START_INTERVIEW, { candidateSocketId: candidateId, durationMinutes })
    }

    const endInterview = () => {
        socket.emit(SocketEvent.END_INTERVIEW)
    }

    useEffect(() => {
        const handleStart = ({ candidateSocketId, endTime }: any) => {
            setIsInterviewMode(true)
            setCandidateSocketId(candidateSocketId)
            setTimerEndTime(endTime)
            toast.success("Interview mode started!")
        }

        const handleEnd = () => {
            setIsInterviewMode(false)
            setCandidateSocketId(null)
            setTimerEndTime(null)
            toast.success("Interview mode ended")
        }

        const handleWarning = ({ username, details }: any) => {
            toast.error(`Malpractice Warning: ${username} ${details}`, { duration: 5000 })
        }

        socket.on(SocketEvent.INTERVIEW_STARTED, handleStart)
        socket.on(SocketEvent.INTERVIEW_ENDED, handleEnd)
        socket.on(SocketEvent.MALPRACTICE_WARNING, handleWarning)

        return () => {
            socket.off(SocketEvent.INTERVIEW_STARTED, handleStart)
            socket.off(SocketEvent.INTERVIEW_ENDED, handleEnd)
            socket.off(SocketEvent.MALPRACTICE_WARNING, handleWarning)
        }
    }, [socket])

    // Malpractice Monitoring for Candidate
    useEffect(() => {
        if (!isInterviewMode || !candidateSocketId || !currentUser) return
        if (candidateSocketId !== socket.id) return // Only monitor the candidate

        const handleVisibilityChange = () => {
            if (document.hidden) {
                socket.emit(SocketEvent.MALPRACTICE_WARNING, { details: "changed tabs or minimized window." })
                toast.error("Warning: Please stay on the interview tab!")
            }
        }

        const handleCopy = () => {
            socket.emit(SocketEvent.MALPRACTICE_WARNING, { details: "copied content." })
            toast.error("Warning: Copying during interview is not recommended.")
        }

        const handlePaste = () => {
            socket.emit(SocketEvent.MALPRACTICE_WARNING, { details: "pasted content." })
            toast.error("Warning: Pasting from external sources is disabled or monitored.")
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        document.addEventListener("copy", handleCopy)
        document.addEventListener("paste", handlePaste)

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange)
            document.removeEventListener("copy", handleCopy)
            document.removeEventListener("paste", handlePaste)
        }
    }, [isInterviewMode, candidateSocketId, currentUser, socket])

    return (
        <InterviewContext.Provider
            value={{
                isInterviewMode,
                candidateSocketId,
                timerEndTime,
                startInterview,
                endInterview,
            }}
        >
            {children}
        </InterviewContext.Provider>
    )
}
