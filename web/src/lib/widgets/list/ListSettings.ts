import type { WidgetSettings_v1 } from "../../types/Widgets";

export interface StackSettings_v1 extends WidgetSettings_v1 {
    items: WidgetSettings_v1[];
}