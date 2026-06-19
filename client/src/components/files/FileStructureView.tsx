import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useViews } from "@/context/ViewContext"
import { useContextMenu } from "@/hooks/useContextMenu"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { ACTIVITY_STATE } from "@/types/app"
import { FileSystemItem, Id } from "@/types/file"
import { USER_ROLE } from "@/types/user"
import { sortFileSystemItem } from "@/utils/file"
import { getIconClassName } from "@/utils/getIconClassName"
import { Icon } from "@iconify/react"
import { toast } from "react-hot-toast"
import { MouseEvent, useEffect, useRef, useState } from "react"
import { 
    ChevronRight, 
    ChevronDown, 
    Folder, 
    FolderOpen, 
    FilePlus, 
    FolderPlus, 
    Edit2,
    Trash2,
    RefreshCw
} from "lucide-react"
import RenameView from "./RenameView"

// FileTreeItem component for individual files and folders
const FileTreeItem = ({ item, depth = 0, setSelectedDirId }: { 
    item: FileSystemItem; 
    depth?: number; 
    setSelectedDirId: (id: Id) => void;
}) => {
    const [isEditing, setEditing] = useState<boolean>(false)
    const { deleteFile, deleteDirectory, openFile, toggleDirectory } = useFileSystem()
    const { setIsSidebarOpen } = useViews()
    const { isMobile } = useWindowDimensions()
    const { activityState, setActivityState, currentUser } = useAppContext()
    const itemRef = useRef<HTMLDivElement | null>(null)
    const { coords, menuOpen, setMenuOpen } = useContextMenu({ ref: itemRef })

    const canEdit = currentUser?.role === USER_ROLE.ADMIN || currentUser?.role === USER_ROLE.EDITOR
    const canDelete = currentUser?.role === USER_ROLE.ADMIN

    const handleClick = () => {
        if (isEditing) return
        setSelectedDirId(item.id)

        if (item.type === "directory") {
            toggleDirectory(item.id)
        } else {
            openFile(item.id)
            if (isMobile) {
                setIsSidebarOpen(false)
            }
            if (activityState === ACTIVITY_STATE.DRAWING) {
                setActivityState(ACTIVITY_STATE.CODING)
            }
        }
    }

    const handleRename = (e: MouseEvent) => {
        e.stopPropagation()
        setMenuOpen(false)
        if (!canEdit) {
            toast.error("You do not have permission to rename files")
            return
        }
        setEditing(true)
    }

    const handleDelete = (e: MouseEvent) => {
        e.stopPropagation()
        setMenuOpen(false)
        if (!canDelete) {
            toast.error("Only administrators can delete files")
            return
        }
        const isConfirmed = confirm(
            `Are you sure you want to delete ${item.type === "directory" ? "directory" : "file"}?`
        )
        if (isConfirmed) {
            if (item.type === "directory") {
                deleteDirectory(item.id)
            } else {
                deleteFile(item.id)
            }
        }
    }

    // Add F2 key event listener for renaming
    useEffect(() => {
        const itemNode = itemRef.current
        if (!itemNode) return

        itemNode.tabIndex = 0
        const handleF2 = (e: KeyboardEvent) => {
            e.stopPropagation()
            if (e.key === "F2") {
                setEditing(true)
            }
        }

        itemNode.addEventListener("keydown", handleF2)
        return () => {
            itemNode.removeEventListener("keydown", handleF2)
        }
    }, [])

    if (item.type === "directory") {
        return (
            <div>
                <div ref={itemRef}>
                    <div
                        className="vscode-file-item"
                        onClick={handleClick}
                        style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    >
                    {item.isOpen ? (
                        <ChevronDown className="vscode-chevron" />
                    ) : (
                        <ChevronRight className="vscode-chevron" />
                    )}
                    {item.isOpen ? (
                        <FolderOpen className="vscode-file-icon folder-open" />
                    ) : (
                        <Folder className="vscode-file-icon folder" />
                    )}
                    {isEditing ? (
                        <RenameView
                            id={item.id}
                            preName={item.name}
                            type="directory"
                            setEditing={setEditing}
                        />
                    ) : (
                        <span className="vscode-file-name">{item.name}</span>
                    )}
                    </div>
                </div>
                {item.isOpen && item.children && (
                    <div>
                        {item.children.map((child) => (
                            <FileTreeItem 
                                key={child.id} 
                                item={child} 
                                depth={depth + 1} 
                                setSelectedDirId={setSelectedDirId}
                            />
                        ))}
                    </div>
                )}
                
                {/* Context Menu */}
                {menuOpen && (
                    <div
                        className="vscode-context-menu"
                        style={{ top: coords.y, left: coords.x }}
                    >
                        {canEdit && (
                            <div
                                onClick={handleRename}
                                className="vscode-context-item"
                            >
                                <Edit2 className="vscode-context-icon" />
                                Rename
                            </div>
                        )}
                        {canDelete && (
                            <div
                                onClick={handleDelete}
                                className="vscode-context-item danger"
                            >
                                <Trash2 className="vscode-context-icon" />
                                Delete
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div ref={itemRef}>
            <div
                className="vscode-file-item"
                onClick={handleClick}
                style={{ paddingLeft: `${depth * 16 + 24}px` }}
            >
            <Icon
                icon={getIconClassName(item.name)}
                className="vscode-file-icon"
            />
            {isEditing ? (
                <RenameView
                    id={item.id}
                    preName={item.name}
                    type="file"
                    setEditing={setEditing}
                />
            ) : (
                <span className="vscode-file-name">{item.name}</span>
            )}
            
            {/* Context Menu */}
            {menuOpen && (
                <div
                    className="vscode-context-menu"
                    style={{ top: coords.y, left: coords.x }}
                >
                    {canEdit && (
                        <div
                            onClick={handleRename}
                            className="vscode-context-item"
                        >
                            <Edit2 className="vscode-context-icon" />
                            Rename
                        </div>
                    )}
                    {canDelete && (
                        <div
                            onClick={handleDelete}
                            className="vscode-context-item danger"
                        >
                            <Trash2 className="vscode-context-icon" />
                            Delete
                        </div>
                    )}
                </div>
            )}
            </div>
        </div>
    )
}

function FileStructureView() {
    const { fileStructure, createFile, createDirectory, collapseDirectories } = useFileSystem()
    const { currentUser } = useAppContext()
    const explorerRef = useRef<HTMLDivElement | null>(null)
    const [selectedDirId, setSelectedDirId] = useState<Id | null>(null)
    
    const canEdit = currentUser?.role === USER_ROLE.ADMIN || currentUser?.role === USER_ROLE.EDITOR

    const handleClickOutside = (e: MouseEvent) => {
        if (explorerRef.current && !explorerRef.current.contains(e.target as Node)) {
            setSelectedDirId(fileStructure.id)
        }
    }

    const handleCreateFile = () => {
        const fileName = prompt("Enter file name")
        if (fileName) {
            const parentDirId: Id = selectedDirId || fileStructure.id
            createFile(parentDirId, fileName)
        }
    }

    const handleCreateDirectory = () => {
        const dirName = prompt("Enter directory name")
        if (dirName) {
            const parentDirId: Id = selectedDirId || fileStructure.id
            createDirectory(parentDirId, dirName)
        }
    }

    const sortedFileStructure = sortFileSystemItem(fileStructure)

    return (
        <>
            {/* Actions Toolbar */}
            <div className="vscode-explorer-toolbar">
                {canEdit && (
                    <>
                        <button
                            className="vscode-toolbar-button"
                            onClick={handleCreateFile}
                            title="New File"
                        >
                            <FilePlus className="vscode-toolbar-icon" />
                        </button>
                        <button
                            className="vscode-toolbar-button"
                            onClick={handleCreateDirectory}
                            title="New Folder"
                        >
                            <FolderPlus className="vscode-toolbar-icon" />
                        </button>
                    </>
                )}
                <button
                    className="vscode-toolbar-button"
                    onClick={collapseDirectories}
                    title="Collapse Folders"
                >
                    <RefreshCw className="vscode-toolbar-icon" />
                </button>
            </div>

            {/* File Tree Content */}
            <div onClick={handleClickOutside} ref={explorerRef}>
                {sortedFileStructure.children &&
                    sortedFileStructure.children.map((item) => (
                        <FileTreeItem
                            key={item.id}
                            item={item}
                            setSelectedDirId={setSelectedDirId}
                        />
                    ))}
            </div>
        </>
    )
}









export default FileStructureView
