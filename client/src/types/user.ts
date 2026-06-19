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
    role?: USER_ROLE
}

interface RemoteUser extends User {
    status: USER_CONNECTION_STATUS
    cursorPosition: number
    typing: boolean
    currentFile: string
    socketId: string
    selectionStart?: number
    selectionEnd?: number
}

enum USER_STATUS {
    INITIAL = "initial",
    CONNECTING = "connecting",
    ATTEMPTING_JOIN = "attempting-join",
    JOINED = "joined",
    CONNECTION_FAILED = "connection-failed",
    DISCONNECTED = "disconnected",
}

export { USER_CONNECTION_STATUS, USER_STATUS, USER_ROLE, RemoteUser, User }
