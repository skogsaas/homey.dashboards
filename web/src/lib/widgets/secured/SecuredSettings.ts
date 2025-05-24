import type { WidgetSettings_v1 } from "../../types/Widgets";

export interface SecuredSettings_v1 extends WidgetSettings_v1 {
    mode: 'hidden' | 'readonly' | 'blur';
    hash: string;
    item: WidgetSettings_v1 | undefined;
}