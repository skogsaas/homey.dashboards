import type { WidgetSettings_v1 } from "../../types/Widgets";

export default interface ImageSettings extends WidgetSettings_v1 {
    deviceId: string | undefined;
    imageId: string | undefined;
    refresh: number | undefined;
    hideTitle: boolean | undefined;
    fontColor: string | undefined;
    fontBlur: boolean | undefined;
}