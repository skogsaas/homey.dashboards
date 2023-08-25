import type { WidgetSettings } from "../../types/Widgets";

export default interface InsightSettings extends WidgetSettings {
    deviceId: string | undefined;
    insightId: string | undefined;
    resolution: string | undefined;
    aggregation: 'none' | 'min' | 'max' | 'sum' | 'avg' | 'first' | 'last';
    sampleRate: number | undefined;
}