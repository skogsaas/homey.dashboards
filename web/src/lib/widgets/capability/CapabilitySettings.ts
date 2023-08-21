import type { WidgetSettings } from "../../types/Widgets";
import { v4 as uuid } from 'uuid';

export default interface CapabilitySettings_v2 extends WidgetSettings {
    deviceId: string | undefined;
    capabilityIds: string[];
}

export interface CapabilitySettings_v1 extends WidgetSettings {
    deviceId: string | undefined;
    capabilityId: string | undefined;
}

export function create() : WidgetSettings {
    return { 
        id: uuid(), 
        type: 'capability', 
        version: 2
     };
}

export function migrate(settings: any) : any {
    switch(settings.version) {
        case 2: return settings;
        
        case 1:
        default: return migrate_v1_v2(settings as CapabilitySettings_v1);
    }
}

function migrate_v1_v2(v1: CapabilitySettings_v1) : CapabilitySettings_v2 {
    const settings: CapabilitySettings_v2 = {
        id: v1.id,
        type: v1.type,
        version: 2,
        deviceId: v1.deviceId,
        capabilityIds: v1.capabilityId ? [ v1.capabilityId ] : []
    }

    return settings;
}