import type { WidgetSettings } from "../../types/Widgets";

export default interface DashboardLinkSettings extends WidgetSettings {
    dashboardId: string | undefined;
    size: number | undefined;
}