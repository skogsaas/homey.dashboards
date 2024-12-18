import type { WidgetSettings_v1 } from "../../types/Widgets";

export interface ListSettings_v1 extends WidgetSettings_v1 {
    items?: WidgetSettings_v1[];
    gap?: 'gap-0' | 'gap-0.5' | 'gap-1' | 'gap-2' | 'gap-3' | 'gap-4' | 'gap-5' | 'gap-6' | 'gap-7' | 'gap-8' | 'gap-9' | 'gap-10';
}