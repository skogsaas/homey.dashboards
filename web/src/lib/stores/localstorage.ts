import { v4 as uuid } from 'uuid';
import { writable } from "svelte/store";
import type { Dashboard_v1, DashboardMap } from "$lib/types/Dashboard";
import type { Template_v1, TemplateMap } from '$lib/types/Template';


function createDashboards() {
    const prefix = 'dashboard-';

    const initialValue = Object
        .keys(localStorage)
        .filter(key => key.startsWith(prefix))
        .reduce((existing: DashboardMap, key: string) => {
            const id = key.slice(prefix.length);
            const d: Dashboard_v1 = JSON.parse(localStorage[key]);

            existing[id] = d;
            return existing;
        }, {} as DashboardMap);

    // Migrate old dashboards
    if(localStorage.dashboards !== undefined) {
        const d: Dashboard_v1 = {
            id: uuid(),
            source: 'localstorage',
            title: 'Dashboard (migrated)',
            items: JSON.parse(localStorage.dashboards)
        };

        const key = prefix + d.id;
        localStorage[key] = JSON.stringify(d);

        // Delete the old dashboard
        delete localStorage.dashboards;

        initialValue[d.id] = d;
    }

    const { subscribe, set, update } = writable(initialValue);
    
    return {
        subscribe,
        update: (d: Dashboard_v2) => {
            const key = prefix + d.id;
            localStorage[key] = JSON.stringify(d);
            
            update((existing: DashboardMap) => {
                const copy = { ...existing };
                copy[d.id] = d;

                return copy;
            })
        },
        delete: (d: Dashboard_v2) => {
            const key = prefix + d.id;

            if(localStorage[key] !== undefined) {
                delete localStorage[key];
            }

            update((existing: DashboardMap) => {
                if(existing[d.id] !== undefined) {
                    const copy = { ...existing };
                    delete copy[d.id];
                    
                    return copy;
                }

                return existing;
            })
        }
    };
}

function createTemplates() {
    const prefix = 'templates-';

    const initialValue = Object
        .keys(localStorage)
        .filter(key => key.startsWith(prefix))
        .reduce((existing: TemplateMap, key: string) => {
            const id = key.slice(prefix.length);
            const d: Template_v1 = JSON.parse(localStorage[key]);

            existing[id] = d;
            return existing;
        }, {} as TemplateMap);

    const { subscribe, set, update } = writable(initialValue);
    
    return {
        subscribe,
        update: (t: Template_v1) => {
            const key = prefix + t.id;
            localStorage[key] = JSON.stringify(t);
            
            update((existing: TemplateMap) => {
                const copy = { ...existing };
                copy[t.id] = t;

                return copy;
            })
        },
        delete: (t: Template_v1) => {
            const key = prefix + t.id;

            if(localStorage[key] !== undefined) {
                delete localStorage[key];
            }

            update((existing: TemplateMap) => {
                if(existing[t.id] !== undefined) {
                    const copy = { ...existing };
                    delete copy[t.id];
                    
                    return copy;
                }

                return existing;
            })
        }
    };
}

export const dashboards = createDashboards();
export const templates = createTemplates();