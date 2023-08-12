import type { WidgetSettings } from "../../types/Widgets";

export default interface ImageSettings extends WidgetSettings {
    deviceId: string | undefined;
    imageId: string | undefined;
    refresh: number | undefined;
}