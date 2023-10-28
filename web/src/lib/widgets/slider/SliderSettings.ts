import type { WidgetSettings } from "../../types/Widgets";
import { v4 as uuid } from 'uuid';

export interface SliderSettings_v2 extends WidgetSettings {
    capabilityUri: string | undefined;
    title: string | undefined;
    hideMinMax: boolean | undefined;
}

export interface SliderSettings_v1 extends WidgetSettings {
    deviceId: string | undefined;
    capabilityId: string | undefined;
    title: string | undefined;
    hideMinMax: boolean | undefined;
}

export function create() : WidgetSettings {
    return { 
        id: uuid(), 
        type: 'slider', 
        version: 2
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
        case 2: return settings;
        case 1:
        default: return migrate_v1_v2(settings as SliderSettings_v1);
    }
}

function migrate_v1_v2(v1: SliderSettings_v1) : SliderSettings_v2 {
    const settings: SliderSettings_v2 = {
        id: v1.id,
        type: v1.type,
        version: 2,
        capabilityUri: 'homey:device:' + v1.deviceId + ':' + v1.capabilityId,
        title: v1.title,
        hideMinMax: v1.hideMinMax
    }

    return settings;
}