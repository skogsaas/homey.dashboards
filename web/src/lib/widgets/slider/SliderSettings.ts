import type { WidgetSettings_v1 } from "../../types/Widgets";
import { v4 as uuid } from 'uuid';

export interface SliderSettings_v3 extends WidgetSettings_v1 {
    uri?: string;
    label?: string;

    min?: number;
    max?: number;
    step?: number;
    decimals?: number;
    
    unit?: string;

    labelPosition?: 'left' | 'right' | 'top' | 'bottom' | 'hidden';
    labelSize?: 'text-xs' | 'text-sm' | 'text-lg' | 'text-xl' | 'text-2xl' | 'text-3xl' | 'text-4xl' | 'text-5xl' | 'text-6xl' | 'text-7xl' | 'text-8xl' | 'text-9xl';
    
    valuePosition?: 'left' | 'right' | 'top' | 'bottom' | 'hidden';
    valueSize?: 'text-xs' | 'text-sm' | 'text-lg' | 'text-xl' | 'text-2xl' | 'text-3xl' | 'text-4xl' | 'text-5xl' | 'text-6xl' | 'text-7xl' | 'text-8xl' | 'text-9xl';

    hideMinMax?: boolean;
}

export interface SliderSettings_v2 extends WidgetSettings_v1 {
    capabilityUri: string | undefined;
    title: string | undefined;
    hideMinMax: boolean | undefined;
}

export interface SliderSettings_v1 extends WidgetSettings_v1 {
    deviceId: string | undefined;
    capabilityId: string | undefined;
    title: string | undefined;
    hideMinMax: boolean | undefined;
}

export function create() : WidgetSettings_v1 {
    return { 
        id: uuid(), 
        type: 'slider', 
        version: 3
     };
}

export function migrate(settings: any) : any {
    while(settings.version !== 3) {
        settings = migrateOnce(settings);
    }

    return settings;
}

export function migrateOnce(settings: any) : any {
    switch(settings.version) {
        case 3: return settings;
        case 2: return migrate_v2_v3(settings as SliderSettings_v2);
        case 1:
        default: return migrate_v1_v2(settings as SliderSettings_v1);
    }
}

function migrate_v2_v3(v2: SliderSettings_v2) : SliderSettings_v3 {
    const settings: SliderSettings_v3 = {
        id: v2.id,
        type: v2.type,
        version: 3,
        uri: v2.capabilityUri,
        label: v2.title,
        hideMinMax: v2.hideMinMax
    };

    return settings;
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