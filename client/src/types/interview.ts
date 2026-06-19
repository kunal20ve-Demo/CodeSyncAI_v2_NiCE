export interface IInterviewContext {
    isInterviewMode: boolean
    candidateSocketId: string | null
    timerEndTime: number | null
    startInterview: (candidateSocketId: string, durationMinutes: number) => void
    endInterview: () => void
}
