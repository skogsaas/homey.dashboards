import { v4 as uuid } from 'uuid';

import type { DashboardMap } from "$lib/types/Dashboard";
import type Dashboard from "$lib/types/Dashboard";
import { writable } from "svelte/store";


function createDashboards() {
    const prefix = 'dashboard-';

    const initialValue = Object
        .keys(localStorage)
        .filter(key => key.startsWith(prefix))
        .reduce((existing: DashboardMap, key: string) => {
            const id = key.slice(prefix.length);
            const d: Dashboard = JSON.parse(localStorage[key]);

            existing[id] = d;
            return existing;
        }, {} as DashboardMap);

    // Migrate old dashboards
    if(localStorage.dashboard !== undefined) {
        const d: Dashboard = {
            id: uuid(),
            source: 'localstorage',
            title: 'Dashboard',
            items: JSON.parse(localStorage.dashboard)
        };

        const key = prefix + d.id;
        localStorage[key] = JSON.stringify(d);

        // Delete the old dashboard
        delete localStorage.dashboard;

        initialValue[d.id] = d;
    }

    const { subscribe, set, update } = writable(initialValue);
    
    return {
        subscribe,
        update: (d: Dashboard) => {
            const key = prefix + d.id;
            localStorage[key] = JSON.stringify(d);
            
            update((existing: DashboardMap) => {
                const copy = { ...existing };
                copy[d.id] = d;

                return copy;
            })
        },
        delete: (d: Dashboard) => {
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

export const dashboards = createDashboards();