import type { GridItem, GridItem_v0 } from "$lib/types/Grid";
import { findCreate } from ".";
import type { CapabilitySettings_v3, CapabilitySettings_v4 } from "./capability/CapabilitySettings";
import { migrateOnce }from "./capability/CapabilitySettings";
import { v4 as uuid } from 'uuid';
import type { DeviceSettings_v1 } from "./device/DeviceSettings";
import type SliderSettings from "./slider/SliderSettings";

export function migrate(item: GridItem) : GridItem {
    switch(item.version) {
        case 1: return item;

        case undefined:
        default: return migrate_v0_v1(item as unknown as GridItem_v0);
    }
}

function migrate_v0_v1(v0: GridItem_v0) : GridItem {
    const item: GridItem = {
        ...v0,
        version: 1,
        card: [v0.settings],
        view: []
    }

    if(v0.settings.type === 'capability') {
        const settings_v3 = migrateCapability(v0.settings) as CapabilitySettings_v3;
        const settings_v4: CapabilitySettings_v4[] = (settings_v3.capabilities ?? []).map(c => ({
            id: uuid(),
            type: 'capability',
            version: 4,
            deviceId: settings_v3.deviceId,
            capabilityId: c.capabilityId,
            title: c.title,
            iconId: undefined
        }));

        const device: DeviceSettings_v1 = { 
            id: uuid(), 
            type: 'device', 
            version: 1,
            deviceId: settings_v3.deviceId,
            title: undefined,
            iconId: undefined
         };
        
        item.card = [device, ...settings_v4];
    } else if(v0.settings.type === 'slider') {
        const settings_v1 = v0.settings as SliderSettings;
        const device: DeviceSettings_v1 = { 
            id: uuid(), 
            type: 'device', 
            version: 1,
            deviceId: settings_v1.deviceId,
            title: undefined,
            iconId: undefined
         };

         item.card = [device, settings_v1];
    }

    return item;
}

function migrateCapability(settings: any) : any {
    while(settings.version < 3) {
        settings = migrateOnce(settings);
    }

    return settings;
}