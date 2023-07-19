import type { WidgetSettings } from "../../types/Widgets";

export default interface ImageSettings extends WidgetSettings {
    deviceId: string | null;
    imageId: string | null;
}