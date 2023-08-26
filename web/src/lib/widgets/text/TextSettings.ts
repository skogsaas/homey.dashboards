import type { WidgetSettings } from "../../types/Widgets";

export default interface TextSettings extends WidgetSettings {
    text: string | undefined;
    size: number | undefined;
}