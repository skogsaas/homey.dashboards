import type { WidgetSettings } from "../../types/Widgets";

export default interface SliderSettings extends WidgetSettings {
    deviceId: string | undefined;
    capabilityId: string | undefined;
    title: string | undefined;
    hideMinMax: boolean | undefined;
}