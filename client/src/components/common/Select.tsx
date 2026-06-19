import { ChangeEvent } from "react"
import { ChevronDown } from "lucide-react"

interface SelectProps {
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void
    value: string
    options: string[]
    title: string
}

function Select({ onChange, value, options, title }: SelectProps) {
    return (
        <div className="vscode-themed-select">
            <label className="vscode-themed-select-label">{title}</label>
            <select
                className="vscode-themed-select-input"
                value={value}
                onChange={onChange}
            >
                {options.sort().map((option) => {
                    const value = option
                    const name =
                        option.charAt(0).toUpperCase() + option.slice(1)

                    return (
                        <option key={name} value={value}>
                            {name}
                        </option>
                    )
                })}
            </select>
            <ChevronDown className="vscode-themed-select-chevron" />
        </div>
    )
}

export default Select
