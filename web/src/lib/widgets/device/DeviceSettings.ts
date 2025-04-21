import type { WidgetSettings_v1 } from "../../types/Widgets";
import { v4 as uuid } from 'uuid';

export function create() : WidgetSettings_v1 {
    return { 
        id: uuid(), 
        type: 'device', 
        version: 1
     };
}

export function migrate(settings: any) : any {
    while(settings.version !== 2) {
        settings = migrateOnce(settings);
    }

    return settings;
}

export function migrateOnce(settings: any) : any {
    switch(settings.version) {
        case 1:
        default: return settings;
    }
}

export interface DeviceSettings_v1 extends WidgetSettings_v1 {
    deviceId: string | undefined;
    title: string | undefined;
    iconId: string | undefined;
}