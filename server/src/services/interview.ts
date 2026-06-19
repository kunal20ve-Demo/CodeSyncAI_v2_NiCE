import { Socket } from "socket.io"
import { SocketEvent } from "../types/socket"
import { User, USER_ROLE } from "../types/user"

interface InterviewSession {
    candidateSocketId: string
    timerEndTime: number
}

class InterviewService {
    private interviewSessions = new Map<string, InterviewSession>()

    public getSession(roomId: string) {
        return this.interviewSessions.get(roomId)
    }

    public isInterviewMode(roomId: string) {
        return this.interviewSessions.has(roomId)
    }

    public attachListeners(socket: Socket, io: any, getUser: (socketId: string) => User | null) {
        socket.on(SocketEvent.START_INTERVIEW, ({ candidateSocketId, durationMinutes }) => {
            const user = getUser(socket.id)
            if (!user || user.role !== USER_ROLE.ADMIN) return

            const endTime = Date.now() + durationMinutes * 60000
            this.interviewSessions.set(user.roomId, {
                candidateSocketId,
                timerEndTime: endTime
            })

            io.to(user.roomId).emit(SocketEvent.INTERVIEW_STARTED, {
                candidateSocketId,
                endTime
            })
        })

        socket.on(SocketEvent.END_INTERVIEW, () => {
            const user = getUser(socket.id)
            if (!user || user.role !== USER_ROLE.ADMIN) return

            this.interviewSessions.delete(user.roomId)
            io.to(user.roomId).emit(SocketEvent.INTERVIEW_ENDED)
        })

        socket.on(SocketEvent.MALPRACTICE_WARNING, ({ details }) => {
            const user = getUser(socket.id)
            if (!user) return
            
            // Only broadcast warning if it came from the candidate during an interview
            const session = this.getSession(user.roomId)
            if (session && session.candidateSocketId === socket.id) {
                // Broadcast to admin/editors
                socket.broadcast.to(user.roomId).emit(SocketEvent.MALPRACTICE_WARNING, {
                    username: user.username,
                    details
                })
            }
        })
    }
}

export const interviewService = new InterviewService()
