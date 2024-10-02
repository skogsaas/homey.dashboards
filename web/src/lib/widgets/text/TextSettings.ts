import type { WidgetSettings_v1 } from "../../types/Widgets";

export default interface TextSettings extends WidgetSettings_v1 {
    text: string | undefined;
    size: number | undefined;
}