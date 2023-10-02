import type { WidgetSettings } from "../../types/Widgets";
import { v4 as uuid } from 'uuid';

export interface CapabilitySettings_v4 extends WidgetSettings {
    deviceId: string | undefined;
    capabilityId: string | undefined;
    title: string | undefined;
    iconId: string | undefined;
}

export interface CapabilitySettings_v3 extends WidgetSettings {
    deviceId: string | undefined;
    capabilities: Capability_v3[] | undefined;
}

export interface Capability_v3 {
    capabilityId: string;
    title: string | undefined;
}

export interface CapabilitySettings_v2 extends WidgetSettings {
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
        version: 3
     };
}

export function migrate(settings: any) : any {
    switch(settings.version) {
        case 4: return settings;

        // This migration should be handled by GridItem migrations
        case 3: return settings;
        
        case 2: return migrate_v2_v3(settings as CapabilitySettings_v2);
        case 1:
        default: return migrate_v1_v2(settings as CapabilitySettings_v1);
    }
}

function migrate_v2_v3(v2: CapabilitySettings_v2) : CapabilitySettings_v3 {
    const settings: CapabilitySettings_v3 = {
        id: v2.id,
        type: v2.type,
        version: 3,
        deviceId: v2.deviceId,
        capabilities: v2.capabilityIds?.map(id => ({ capabilityId: id, title: undefined })) ?? []
    }

    return settings;
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