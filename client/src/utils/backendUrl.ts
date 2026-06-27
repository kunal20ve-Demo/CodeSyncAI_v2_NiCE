export const getBackendUrl = () => {
    let url = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
    if (url && !url.startsWith("http")) {
        url = `https://${url}`
    }
    return url
}
