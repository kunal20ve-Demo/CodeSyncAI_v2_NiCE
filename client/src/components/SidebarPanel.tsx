import { useViews } from "@/context/ViewContext"
import { VIEWS } from "@/types/view"
import FilesView from "./sidebar/sidebar-views/FilesView"
import ChatsView from "./sidebar/sidebar-views/ChatsView"
import CopilotView from "./sidebar/sidebar-views/CopilotView"
import RunView from "./sidebar/sidebar-views/RunView"
import ClientsView from "./sidebar/sidebar-views/ClientsView"
import SettingsView from "./sidebar/sidebar-views/SettingsView"
import ReviewView from "./sidebar/sidebar-views/ReviewView"

function SidebarPanel() {
    const { activeView } = useViews()

    const renderActiveView = () => {
        switch (activeView) {
            case VIEWS.FILES:
                return <FilesView />
            case VIEWS.CHATS:
                return <ChatsView />
            case VIEWS.COPILOT:
                return <CopilotView />
            case VIEWS.RUN:
                return <RunView />
            case VIEWS.CLIENTS:
                return <ClientsView />
            case VIEWS.SETTINGS:
                return <SettingsView />
            case VIEWS.REVIEW:
                return <ReviewView />
            default:
                return <FilesView />
        }
    }

    return (
        <div className="vscode-file-explorer">
            {renderActiveView()}
        </div>
    )
}

export default SidebarPanel
