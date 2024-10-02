import type { WidgetSettings_v1 } from "../../types/Widgets";
import { v4 as uuid } from 'uuid';

export interface CapabilitySettings_v5 extends WidgetSettings_v1 {
    capabilityUri: string | undefined;
    title: string | undefined;
    iconId: string | undefined;
}

export interface CapabilitySettings_v4 extends WidgetSettings_v1 {
    deviceId: string | undefined;
    capabilityId: string | undefined;
    title: string | undefined;
    iconId: string | undefined;
}

export interface CapabilitySettings_v3 extends WidgetSettings_v1 {
    deviceId: string | undefined;
    capabilities: Capability_v3[] | undefined;
}

export interface Capability_v3 {
    capabilityId: string;
    title: string | undefined;
}

export interface CapabilitySettings_v2 extends WidgetSettings_v1 {
    deviceId: string | undefined;
    capabilityIds: string[];
}

export interface CapabilitySettings_v1 extends WidgetSettings_v1 {
    deviceId: string | undefined;
    capabilityId: string | undefined;
}

export function create() : WidgetSettings_v1 {
    return { 
        id: uuid(), 
        type: 'capability', 
        version: 5
     };
}

export function migrate(settings: any) : any {
    while(settings.version !== 5) {
        settings = migrateOnce(settings);
    }

    return settings;
}

export function migrateOnce(settings: any) : any {
    switch(settings.version) {
        case 5: return settings;
        case 4: return migrate_v4_v5(settings as CapabilitySettings_v4);
        case 3: return migrate_v3_v4(settings);
        case 2: return migrate_v2_v3(settings as CapabilitySettings_v2);
        case 1:
        default: return migrate_v1_v2(settings as CapabilitySettings_v1);
    }
}

function migrate_v4_v5(v4: CapabilitySettings_v4) : CapabilitySettings_v5 {
    const settings: CapabilitySettings_v5 = {
        id: v4.id,
        type: v4.type,
        version: 5,
        capabilityUri: 'homey:device:' + v4.deviceId + ':' + v4.capabilityId,
        title: v4.title,
        iconId: v4.iconId
    }

    return settings;
}

function migrate_v3_v4(v3: any) : CapabilitySettings_v4 {
    return {...v3, version: 4}; // This migration is handled by a grid item migration.
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