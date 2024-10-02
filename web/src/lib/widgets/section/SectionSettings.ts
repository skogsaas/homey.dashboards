import type { WidgetSettings_v1 } from "../../types/Widgets";

export interface SectionSettings_v1 extends WidgetSettings_v1 {
    title: string | undefined;
    iconId: string | undefined;
    items: WidgetSettings_v1[];
}