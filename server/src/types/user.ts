enum USER_CONNECTION_STATUS {
	OFFLINE = "offline",
	ONLINE = "online",
}

enum USER_ROLE {
	ADMIN = "admin",
	EDITOR = "editor",
	VIEWER = "viewer",
}

interface User {
	username: string
	roomId: string
	status: USER_CONNECTION_STATUS
	cursorPosition: number
	typing: boolean
	currentFile: string | null
	socketId: string
	selectionStart?: number
	selectionEnd?: number
	role?: USER_ROLE
}

export { USER_CONNECTION_STATUS, USER_ROLE, User }
