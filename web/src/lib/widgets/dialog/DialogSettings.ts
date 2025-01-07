import type { WidgetSettings_v1 } from "../../types/Widgets";

export interface DialogSettings_v1 extends WidgetSettings_v1 {
    summary?: WidgetSettings_v1;
    details?: WidgetSettings_v1;
}