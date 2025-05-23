import type { WidgetSettings_v1 } from "../../types/Widgets";

export interface ReadonlySettings_v1 extends WidgetSettings_v1 {
    item: WidgetSettings_v1 | undefined;
}