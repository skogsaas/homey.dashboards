import type { WidgetSettings_v1 } from "../../types/Widgets";

export interface ListSettings_v1 extends WidgetSettings_v1 {
    items: WidgetSettings_v1[];
}