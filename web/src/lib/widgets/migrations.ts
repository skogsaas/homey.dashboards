import type { GridItem_v1, GridItem_v2, GridOptions_v1 } from "$lib/types/Grid";
import { findMigration } from ".";
import type { CapabilitySettings_v3, CapabilitySettings_v4 } from "./capability/CapabilitySettings";
import { v4 as uuid } from 'uuid';
import type { DeviceSettings_v1 } from "./device/DeviceSettings";
import type { SliderSettings_v1 } from "./slider/SliderSettings";
import type { Dashboard_v1, Dashboard_v2 } from "$lib/types/Store";
import type { WidgetSettings_v1 } from "$lib/types/Widgets";
import type { CardSettings_v1 } from '$lib/widgets/card/CardSettings';
import GridInfo from '$lib/widgets/grid'
import type { GridSettings_v1 } from "./grid/GridSettings";

export function migrate(dashboard: any) : any {
    if(dashboard === undefined) return undefined;

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
    const items = (v1.items ?? []).map(item => migrateGridItem_v1_v2(item));
    const options: GridOptions_v1 = { 
        cellHeight: 50,
        columnOpts: { 
            layout: 'scale',
            columnMax: 24,
            breakpoints: [
                { c: 3, w: 768 },
                { c: 6, w: 1024 },
                { c: 12, w: 1280 },
                { c: 24, w: undefined }
            ]
        },
        float: true,
        margin: 10
    };

    const grid = GridInfo.create() as GridSettings_v1;
    grid.items = items;
    grid.options = options;

    const dashboard: Dashboard_v2 = {
        id: v1.id,
        version: 2,
        title: v1.title,
        iconId: undefined,
        backgroundImage: v1.backgroundImage,
        style: undefined,
        root: grid
    }

    return dashboard;
}

function migrateGridItem_v1_v2(v1: GridItem_v1) : GridItem_v2 {
    function createCard(widgets: WidgetSettings_v1[]) : CardSettings_v1 {
        return {
            id: uuid(),
            type: 'card', 
            version: 1,
            items: widgets,
            padding: 'p-0'
        }
    }

    return {
        id: v1.id,
        settings: createCard(v1.card), 
        position: {
            x: v1[24].x,
            y: v1[24].y,
            w: v1[24].w,
            h: v1[24].h
        }
    };
}

function migrateGridItem_v0_v1(v0: any) : GridItem_v1 {
    if(v0.version === 1) return v0 as GridItem_v1;

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