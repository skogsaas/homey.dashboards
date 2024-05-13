import type { GridItem_v1, GridItem_v2 } from "$lib/types/Grid";
import { findMigration } from ".";
import type { CapabilitySettings_v3, CapabilitySettings_v4 } from "./capability/CapabilitySettings";
import { v4 as uuid } from 'uuid';
import type { DeviceSettings_v1 } from "./device/DeviceSettings";
import type { SliderSettings_v1 } from "./slider/SliderSettings";
import type { Dashboard_v1, Dashboard_v2 } from "$lib/types/Dashboard";
import type { WidgetSettings } from "$lib/types/Widgets";
import type { CardSettings_v1 } from "./card/CardSettings";

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
    const items = v1.items.map(item => migrateGridItem_v1_v2(item));

    const dashboard: Dashboard_v2 = {
        id: v1.id,
        version: 2,
        source: v1.source,
        title: v1.title,
        iconId: undefined,
        backgroundImage: v1.backgroundImage,
        items: items,
        layouts: [
            {
                minWidth: 640,
                maxWidth: undefined,
                columns: 6,
                rowHeight: 50
            },
            {
                minWidth: 768,
                maxWidth: undefined,
                columns: 12,
                rowHeight: 50
            },
            {
                minWidth: 1024,
                maxWidth: undefined,
                columns: 18,
                rowHeight: 50
            },
            {
                minWidth: 1280,
                maxWidth: undefined,
                columns: 24,
                rowHeight: 50
            },
        ]
    }

    return dashboard;
}

function migrateGridItem_v1_v2(v1: GridItem_v1) : GridItem_v2 {
    function createCard(widgets: WidgetSettings[]) : CardSettings_v1 {
        const id = uuid();

        const count = widgets.length;
        const ratio = 50;
        const rowHeight = 32;
        let offset1 = 0;
        let offset2 = 0;
        let offset3 = 0;
        let offset4 = 0;

        return { 
            id: id, 
            type: 'card', 
            version: 1,
            items: widgets.map((widget, index) => {
                const y1 = offset1;
                const y2 = offset2;
                const y3 = offset3;
                const y4 = offset4;

                // Height of an element is by default 32 px.
                let h1 = 1 * rowHeight;
                let h2 = 1 * rowHeight;
                let h3 = 1 * rowHeight;
                let h4 = 1 * rowHeight;
                
                if(widget.type === 'image' || widget.type === 'insight' || widget.type === 'iframe') {
                    // Expand to max height
                    const remaining = count - (index + 1);

                    h1 = v1[6].h * ratio - offset1 - remaining * rowHeight;
                    h2 = v1[12].h * ratio - offset2 - remaining * rowHeight;
                    h3 = v1[18].h * ratio - offset3 - remaining * rowHeight;
                    h4 = v1[24].h * ratio - offset4 - remaining * rowHeight;
                }
                
                offset1 += h1;
                offset2 += h2;
                offset3 += h3;
                offset4 += h4;
                
                return { 
                    id: widget.id,
                    settings: widget,
                    layouts:[
                        { 
                            id: widget.id, 
                            x: 0,
                            y: y1,
                            w: 1,
                            h: h1
                        },
                        { 
                            id: widget.id, 
                            x: 0,
                            y: y2,
                            w: 1,
                            h: h2
                        },
                        { 
                            id: widget.id, 
                            x: 0,
                            y: y3,
                            w: 1,
                            h: h3
                        },
                        { 
                            id: widget.id, 
                            x: 0,
                            y: y4,
                            w: 1,
                            h: h4
                        }
                    ]
                }
            }),
            layouts: [
                {
                    minWidth: 0,
                    maxWidth: v1[6].w * ratio,
                    columns: 1,
                    rowHeight: 1
                },
                {
                    minWidth: v1[6].w * ratio,
                    maxWidth: v1[12].w * ratio,
                    columns: 1,
                    rowHeight: 1
                },
                {
                    minWidth: v1[12].w * ratio,
                    maxWidth: v1[18].w * ratio,
                    columns: 1,
                    rowHeight: 1
                },
                {
                    minWidth: v1[24].w * ratio,
                    maxWidth: undefined,
                    columns: 1,
                    rowHeight: 1
                }
            ],
            padding: 0,
            margin: 5
        }
    }

    return {
        id: v1.id,
        settings: createCard(v1.card), 
        layouts: [
            { 
                id: v1.id, 
                x: v1[6].x,
                y: v1[6].y,
                w: v1[6].w,
                h: v1[6].h
            },
            { 
                id: v1.id, 
                x: v1[12].x,
                y: v1[12].y,
                w: v1[12].w,
                h: v1[12].h
            },
            { 
                id: v1.id, 
                x: v1[18].x,
                y: v1[18].y,
                w: v1[18].w,
                h: v1[18].h
            },
            { 
                id: v1.id, 
                x: v1[24].x,
                y: v1[24].y,
                w: v1[24].w,
                h: v1[24].h
            }
        ]
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