import type { WidgetSettings } from "$lib/types/Widgets";

import { v4 as uuid } from 'uuid';

export interface ColumnSettings_v1 extends WidgetSettings {
    children: { id: string }[];
}

export function create() : ColumnSettings_v1 {
    return { 
        id: uuid(), 
        type: 'column', 
        version: 1,
        children: []
     };
}