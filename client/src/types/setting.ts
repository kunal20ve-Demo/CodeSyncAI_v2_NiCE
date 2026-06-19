interface Settings {
    theme: string
    language: string
    fontSize: number
    fontFamily: string
    showGitHubCorner: boolean
    openAIApiKey: string
}

interface SettingsContext extends Settings {
    setTheme: (theme: string) => void
    setLanguage: (language: string) => void
    setFontSize: (fontSize: number) => void
    setFontFamily: (fontFamily: string) => void
    setShowGitHubCorner: (showGitHubCorner: boolean) => void
    setOpenAIApiKey: (openAIApiKey: string) => void
    resetSettings: () => void
}

export { Settings, SettingsContext }
