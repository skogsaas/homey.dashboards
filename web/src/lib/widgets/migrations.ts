import type { GridItem_v1, GridItem_v0 } from "$lib/types/Grid";
import { findCreate, findMigration } from ".";
import type { CapabilitySettings_v3, CapabilitySettings_v4 } from "./capability/CapabilitySettings";
import { v4 as uuid } from 'uuid';
import type { DeviceSettings_v1 } from "./device/DeviceSettings";
import type { SliderSettings_v1 } from "./slider/SliderSettings";
import type { Dashboard_v1, Dashboard_v2 } from "$lib/types/Dashboard";

export function migrate(dashboard: any) : any {
    while(dashboard.version !== 2) {
        dashboard = migrateOnce(dashboard);
    }

    return dashboard;
}

export function migrateOnce(dashboard: any) : any {
    switch(dashboard.version) {
        case 2: return dashboard;

        case undefined:
        default: return migrate_v1_v2(dashboard as Dashboard_v1);
    }
}

function migrate_v1_v2(v1: Dashboard_v1) : Dashboard_v2 {
    const items = v1.items.map(item => migrateItem(item));
    const widgets = items.flatMap((item) => item.card).map(widget => migrateWidget(widget));

    const dashboard: Dashboard_v2 = {
        id: v1.id,
        version: 2,
        source: v1.source,
        title: v1.title,
        backgroundImage: v1.backgroundImage,
        layouts: [
            {
                breakpoint: 640,
                columns: 6,
                rowHeight: 50,
                items: items.map(item => ({ id: item.id, x: item[6].x, y: item[6].y, h: item[6].h, w: item[6].w }))
            },
            {
                breakpoint: 768,
                columns: 12,
                rowHeight: 50,
                items: items.map(item => ({ id: item.id, x: item[12].x, y: item[12].y, h: item[12].h, w: item[12].w }))
            },
            {
                breakpoint: 1024,
                columns: 18,
                rowHeight: 50,
                items: items.map(item => ({ id: item.id, x: item[18].x, y: item[18].y, h: item[18].h, w: item[18].w }))
            },
            {
                breakpoint: 1280,
                columns: 24,
                rowHeight: 50,
                items: items.map(item => ({ id: item.id, x: item[24].x, y: item[24].y, h: item[24].h, w: item[24].w }))
            },
        ],
        widgets: widgets.reduce((obj: any, widget) => { obj[widget.id] = widget; return obj; }, {}),
    }

    return dashboard;
}

function migrateItem(item: any) : GridItem_v1 {
    while(item.version !== 1) {
        item = migrateItemOnce(item);
    }

    return item;
}

function migrateItemOnce(item: any) : any {
    switch(item.version) {
        case 1: return item;

        case undefined:
        default: return migrateItem_v0_v1(item as GridItem_v0);
    }
}

function migrateItem_v0_v1(v0: GridItem_v0) : GridItem_v1 {
    const item: GridItem_v1 = {
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
        const settings_v1 = v0.settings as SliderSettings_v1;
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

function migrateWidget(widget: any) {
    const migration = findMigration(widget.type);
    return migration !== undefined ? migration(widget) : widget;
}