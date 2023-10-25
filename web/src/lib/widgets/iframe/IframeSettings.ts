import type { WidgetSettings } from "../../types/Widgets";

export default interface DashboardLinkSettings extends WidgetSettings {
    url: string | undefined;
    height: number | undefined;
    width: number | undefined;
}