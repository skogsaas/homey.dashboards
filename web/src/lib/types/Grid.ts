import type { WidgetSettings, WidgetSettingsMap } from "./Widgets";

import { create as createColumn } from '$lib/widgets/column/ColumnSettings';

export interface Grid {
    columns: number;
    width: number;
    pxX: number;
    pxY: number;
    gaps: number[];
}

export interface GridItem_v1 {
    id: string;
    version: number;
    
    card: WidgetSettings[];
    view: WidgetSettings[];
    
    [key: number]: GridBreakpointItem;
}

export interface GridItem_v0 {
    id: string;
    version: number;
    settings: WidgetSettings;
    
    [key: number]: GridBreakpointItem;
}

export interface GridBreakpointItem {
    x: number; 
    y: number;
    h: number;
    w: number;
    resizable: boolean;
    draggable: boolean;
    fixed: boolean;
    customDragger: boolean;
    customResizer: boolean;
}

export interface GridResizeEvent {
    cols: number;
    width: number;
    xPerPx: number;
    yPerPx: number;
}

export interface GridItemCollectionSettings_v2 {
    root: string;
    widgets: WidgetSettingsMap;
}

export const createItemCollection = () : GridItemCollectionSettings_v2 => {
    const root = createColumn();
    return {
        root: root.id,
        widgets: {
            [root.id]: root
        }
    }
}