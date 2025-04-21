import type { WidgetSettings_v1 } from "../../types/Widgets";

export default interface DashboardLinkSettings extends WidgetSettings_v1 {
    dashboardId: string | undefined;
    size: number | undefined;
    iconId: string | undefined;
}