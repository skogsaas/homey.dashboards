import type { WidgetSettings } from "$lib/types/Widgets";

import { v4 as uuid } from 'uuid';

export interface RowSettings_v1 extends WidgetSettings {
    children: { id: string, isDndShadowItem: boolean | undefined }[];
}

export function create() : RowSettings_v1 {
    return { 
        id: uuid(), 
        type: 'row', 
        version: 1,
        children: []
     };
}