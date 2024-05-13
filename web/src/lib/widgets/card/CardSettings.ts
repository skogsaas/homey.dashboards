import type { GridItem_v2, GridLayout_v2 } from "$lib/types/Grid";
import type { WidgetSettings } from "../../types/Widgets";

export interface CardSettings_v1 extends WidgetSettings {
    layouts: GridLayout_v2[] | undefined;
    items: GridItem_v2[] | undefined;

    margin: number | undefined;
    padding: number | undefined;
}