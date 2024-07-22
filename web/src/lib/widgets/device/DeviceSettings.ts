import type { WidgetSettings_v1 } from "../../types/Widgets";

export interface DeviceSettings_v1 extends WidgetSettings_v1 {
    deviceId: string | undefined;
    title: string | undefined;
    iconId: string | undefined;
}