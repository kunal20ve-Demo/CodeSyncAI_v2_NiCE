import { ICopilotContext } from "@/types/copilot"
import { createContext, ReactNode, useContext, useState } from "react"
import toast from "react-hot-toast"
import { useSettings } from "./SettingContext"

const CopilotContext = createContext<ICopilotContext | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useCopilot = () => {
    const context = useContext(CopilotContext)
    if (context === null) {
        throw new Error(
            "useCopilot must be used within a CopilotContextProvider",
        )
    }
    return context
}

const CopilotContextProvider = ({ children }: { children: ReactNode }) => {
    const [input, setInput] = useState<string>("")
    const [output, setOutput] = useState<string>("")
    const [isRunning, setIsRunning] = useState<boolean>(false)
    const { openAIApiKey } = useSettings()

    const generateCode = async () => {
        try {
            if (input.length === 0) {
                toast.error("Please write a prompt")
                return
            }

            toast.loading("Generating code...")
            setIsRunning(true)

            const messages = [
                {
                    role: "system",
                    content:
                        "You are a code generator copilot for project named Code Sync. Generate code based on the given prompt without any explanation. Return only the code, formatted in Markdown using the appropriate language syntax (e.g., js for JavaScript, py for Python). Do not include any additional text or explanations. If you don't know the answer, respond with 'I don't know'.",
                },
                {
                    role: "user",
                    content: input,
                },
            ]

            const headers: Record<string, string> = { "Content-Type": "application/json" }
            const payload: any = { messages }

            if (!openAIApiKey || openAIApiKey.length < 5) {
                toast.dismiss()
                setIsRunning(false)
                toast.error("Please provide a valid OpenAI API Key in Settings")
                return
            }

            const url = "https://api.openai.com/v1/chat/completions"
            headers["Authorization"] = `Bearer ${openAIApiKey}`
            // Using GPT-3.5-turbo as it handles most basic tiers easily without maxing rate limits
            payload.model = "gpt-3.5-turbo" 

            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.error?.message || `API Error: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            const code = data.choices?.[0]?.message?.content

            if (code) {
                toast.success("Code generated successfully")
                setOutput(code)
            } else {
                toast.error("Got an empty response from AI")
            }
            setIsRunning(false)
            toast.dismiss()
        } catch (error: any) {
            console.error(error)
            setIsRunning(false)
            toast.dismiss()
            toast.error(error?.message || "Failed to generate the code")
        }
    }

    return (
        <CopilotContext.Provider
            value={{
                setInput,
                output,
                isRunning,
                generateCode,
            }}
        >
            {children}
        </CopilotContext.Provider>
    )
}

export { CopilotContextProvider }
export default CopilotContext
