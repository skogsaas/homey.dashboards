import type { GridItem_v2, GridLayout_v1 } from "$lib/types/Grid";
import type { WidgetSettings } from "../../types/Widgets";

export interface CanvasSettings_v1 extends WidgetSettings {
    layouts: GridLayout_v1[] | undefined;
    items: GridItem_v2[] | undefined;

    columns: number | undefined;
    rowHeight: number | undefined;
    backgroundImage: string | undefined;
}