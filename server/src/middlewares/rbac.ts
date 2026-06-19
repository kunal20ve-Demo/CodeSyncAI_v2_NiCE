import { Socket } from "socket.io"
import { SocketEvent } from "../types/socket"
import { USER_ROLE, User } from "../types/user"
import { interviewService } from "../services/interview"

// Map of event names to allowed roles
const PERMISSIONS: Record<string, USER_ROLE[]> = {
	[SocketEvent.DIRECTORY_CREATED]: [USER_ROLE.ADMIN, USER_ROLE.EDITOR],
	[SocketEvent.DIRECTORY_UPDATED]: [USER_ROLE.ADMIN, USER_ROLE.EDITOR],
	[SocketEvent.DIRECTORY_RENAMED]: [USER_ROLE.ADMIN, USER_ROLE.EDITOR],
	[SocketEvent.DIRECTORY_DELETED]: [USER_ROLE.ADMIN],
	[SocketEvent.FILE_CREATED]: [USER_ROLE.ADMIN, USER_ROLE.EDITOR],
	[SocketEvent.FILE_UPDATED]: [USER_ROLE.ADMIN, USER_ROLE.EDITOR],
	[SocketEvent.FILE_RENAMED]: [USER_ROLE.ADMIN, USER_ROLE.EDITOR],
	[SocketEvent.FILE_DELETED]: [USER_ROLE.ADMIN],
	[SocketEvent.TYPING_START]: [USER_ROLE.ADMIN, USER_ROLE.EDITOR],
	[SocketEvent.TYPING_PAUSE]: [USER_ROLE.ADMIN, USER_ROLE.EDITOR],
}

export function rbacMiddleware(getUser: (socketId: string) => User | null) {
	return (socket: Socket) => {
		socket.use(([event, ...args], next) => {
			const allowedRoles = PERMISSIONS[event]

			// If event doesn't require specific role, let it through
			if (!allowedRoles) {
				return next()
			}

			const user = getUser(socket.id)
			if (!user) {
				return next(new Error("User not found"))
			}

			// Interview Mode check: Only candidate can edit
			const session = interviewService.getSession(user.roomId)
			if (session) {
				// During an interview, block structural or content events unless from the candidate
				if (socket.id !== session.candidateSocketId) {
					return next(new Error("Unauthorized: Interview mode active. Only the candidate can edit."))
				}
			}

			if (user.role && allowedRoles.includes(user.role)) {
				return next()
			}

			// If not allowed, we raise an error. The client can handle it or just ignore.
			return next(new Error("Unauthorized: Insufficient role permissions"))
		})
	}
}
