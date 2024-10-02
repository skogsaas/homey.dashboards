import type { GridItem_v2, GridOptions_v1 } from "$lib/types/Grid";
import type { WidgetSettings_v1 } from "../../types/Widgets";

export interface GridSettings_v1 extends WidgetSettings_v1 {
    options: GridOptions_v1 | undefined;
    items: GridItem_v2[] | undefined;
}