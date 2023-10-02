import type { WidgetSettings } from "../../types/Widgets";

export interface DeviceSettings_v1 extends WidgetSettings {
    deviceId: string | undefined;
    title: string | undefined;
    iconId: string | undefined;
}