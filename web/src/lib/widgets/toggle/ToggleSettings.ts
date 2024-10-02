import type { WidgetSettings_v1 } from "../../types/Widgets";
import { v4 as uuid } from 'uuid';

export interface ToggleSettings_v1 extends WidgetSettings_v1 {
    uri: string | undefined;
    label: string | undefined;
    iconId: string | undefined;
}

export function create() : WidgetSettings_v1 {
    return { 
        id: uuid(), 
        type: 'toggle', 
        version: 1
     };
}

export function migrate(settings: any) : any {
    while(settings.version !== 1) {
        settings = migrateOnce(settings);
    }

    return settings;
}

export function migrateOnce(settings: any) : any {
    switch(settings.version) {
        case 1: return settings;
    }
}