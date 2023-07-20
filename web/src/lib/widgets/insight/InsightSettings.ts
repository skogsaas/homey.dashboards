import type { WidgetSettings } from "../../types/Widgets";

export default interface InsightSettings extends WidgetSettings {
    deviceId: string | null;
    insightId: string | null;
}