import { useFileSystem } from "@/context/FileContext"
import Editor from "./Editor"
import FileTab from "./FileTab"

function EditorComponent() {
    const { openFiles } = useFileSystem()

    if (openFiles.length <= 0) {
        return (
            <div className="vscode-editor-empty">
                <h2>No file is currently open</h2>
                <p>Open a file from the explorer to start editing</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <FileTab />
            <div className="flex-1 overflow-hidden">
                <Editor />
            </div>
        </div>
    )
}

export default EditorComponent
