import type { WidgetSettings } from "../../types/Widgets";

export default interface CapabilitySettings extends WidgetSettings {
    deviceId: string | null;
    capabilityId: string | null;
}