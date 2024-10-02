import type { WidgetSettings_v1 } from "$lib/types/Widgets";

export interface SectionsSettings_v1 extends WidgetSettings_v1 {
    items: WidgetSettings_v1[] | undefined;
}