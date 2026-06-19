/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{jsx,tsx}", "./*.html"],
    theme: {
        extend: {
            colors: {
                // VS Code-like dark theme colors
                dark: "#1e1e1e",           // Main background (darker)
                darkSecondary: "#252526",   // Secondary background
                darkHover: "#2a2d2e",      // Hover states
                darkBorder: "#3e3e42",     // Borders
                sidebarBg: "#252526",      // Sidebar background
                tabBg: "#2d2d30",          // Tab background
                tabActive: "#1e1e1e",      // Active tab
                light: "#f5f5f5",
                primary: "#007acc",        // VS Code blue
                primaryHover: "#1177bb",   // Darker blue for hover
                success: "#4ec9b0",        // Teal for success
                warning: "#dcdcaa",        // Yellow for warnings
                danger: "#f44747",         // Red for errors
                textPrimary: "#cccccc",    // Main text color
                textSecondary: "#969696",  // Secondary text
                textMuted: "#6a6a6a",      // Muted text
                
                // shadcn/ui compatible colors
                border: "#3e3e42",
                input: "#2d2d30",
                ring: "#007acc",
                background: "#1e1e1e",
                foreground: "#cccccc",
                accent: "#007acc",
                "accent-foreground": "#ffffff",
                muted: "#252526",
                "muted-foreground": "#969696",
                "editor-hover": "#2a2d2e",
                "editor-active": "#37373d",
            },
            fontFamily: {
                poppins: ["Poppins", "sans-serif"],
                mono: ["'Fira Code'", "'Cascadia Code'", "'JetBrains Mono'", "Consolas", "monospace"],
            },
            animation: {
                "up-down": "up-down 2s ease-in-out infinite alternate",
            },
        },
    },
    plugins: [],
}
