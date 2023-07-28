import type { WidgetSettings } from "./Widgets";

export interface Grid {
    columns: number;
    width: number;
    pxX: number;
    pxY: number;
    gaps: number[];
}

export interface GridItem {
    id: string;
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
}

export interface GridResizeEvent {
    cols: number;
    width: number;
    xPerPx: number;
    yPerPx: number;
}