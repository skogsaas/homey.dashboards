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