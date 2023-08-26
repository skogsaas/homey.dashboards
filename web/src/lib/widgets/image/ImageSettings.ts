import type { WidgetSettings } from "../../types/Widgets";

export default interface ImageSettings extends WidgetSettings {
    deviceId: string | undefined;
    imageId: string | undefined;
    refresh: number | undefined;
    hideTitle: boolean | undefined;
    fontColor: string | undefined;
    fontBlur: boolean | undefined;
}