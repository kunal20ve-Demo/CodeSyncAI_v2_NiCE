import { Socket } from "socket.io"
import { SocketEvent } from "../types/socket"
import { User, USER_CONNECTION_STATUS } from "../types/user"

export interface UserAnalytics {
	linesOfCode: number
	activeTime: number // in seconds
	numberOfEdits: number
	fileContributions: Set<string>
	role?: string
}

class AnalyticsService {
	private analyticsMap = new Map<string, Map<string, UserAnalytics>>()
	private sessionStartMap = new Map<string, { roomId: string, username: string, startTime: number }>()

	private getAnalytics(roomId: string, username: string): UserAnalytics {
		if (!this.analyticsMap.has(roomId)) {
			this.analyticsMap.set(roomId, new Map())
		}
		const roomData = this.analyticsMap.get(roomId)!
		if (!roomData.has(username)) {
			roomData.set(username, {
				linesOfCode: 0,
				activeTime: 0,
				numberOfEdits: 0,
				fileContributions: new Set(),
			})
		}
		return roomData.get(username)!
	}

	public onUserJoin(user: User) {
		const stats = this.getAnalytics(user.roomId, user.username)
		stats.role = user.role
		this.sessionStartMap.set(user.socketId, {
			roomId: user.roomId,
			username: user.username,
			startTime: Date.now()
		})
	}

	public onUserLeave(user: User) {
		const session = this.sessionStartMap.get(user.socketId)
		if (session) {
			const duration = (Date.now() - session.startTime) / 1000
			const stats = this.getAnalytics(user.roomId, user.username)
			stats.activeTime += duration
			this.sessionStartMap.delete(user.socketId)
		}
	}

	public onFileEdit(user: User, fileId: string, content: string) {
		const stats = this.getAnalytics(user.roomId, user.username)
		stats.numberOfEdits += 1
		stats.fileContributions.add(fileId)
		stats.linesOfCode = content.split('\n').length // Very naive LOC count, but works for the dashboard
	}

	public getRoomAnalytics(roomId: string) {
		const roomData = this.analyticsMap.get(roomId)
		if (!roomData) return []
		
		const currentSessions = new Map<string, number>()
		for (const session of this.sessionStartMap.values()) {
			if (session.roomId === roomId) {
				const duration = (Date.now() - session.startTime) / 1000
				const currentDuration = currentSessions.get(session.username) || 0
				currentSessions.set(session.username, currentDuration + duration)
			}
		}

		const result: any[] = []
		for (const [username, stats] of roomData.entries()) {
			const currentDuration = currentSessions.get(username) || 0
			result.push({
				username,
				role: stats.role,
				linesOfCode: stats.linesOfCode,
				activeTime: Math.round(stats.activeTime + currentDuration),
				numberOfEdits: stats.numberOfEdits,
				fileContributions: stats.fileContributions.size,
			})
		}
		return result
	}

	public attachListeners(socket: Socket, getUser: (socketId: string) => User | null) {
		socket.on(SocketEvent.FILE_UPDATED, ({ fileId, newContent }) => {
			const user = getUser(socket.id)
			if (user) {
				this.onFileEdit(user, fileId, newContent)
			}
		})
        
        socket.on("get-analytics", ({ roomId }) => {
            // Update active times for online users before returning
            // For a production app we could be more granular, but for the hackathon this is fine
            socket.emit("analytics-updated", this.getRoomAnalytics(roomId))
        })
	}
}

export const analyticsService = new AnalyticsService()
