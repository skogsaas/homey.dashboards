import type { WidgetSettings_v1 } from "../../types/Widgets";

export interface CardSettings_v1 extends WidgetSettings_v1 {
    items?: WidgetSettings_v1[];

    padding?: 'p-0' | 'p-1' | 'p-2' | 'p-3' | 'p-4' | 'p-5' | undefined;
}