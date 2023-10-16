import { derived, writable } from 'svelte/store';
import { page } from '$app/stores';

import type { 
    AdvancedFlow, 
    AdvancedFlowMap, 
    AppObj, 
    BasicFlow, 
    BasicFlowMap, 
    CapabilityEvent, 
    DeviceMap, 
    DeviceObj, 
    FlowFolderMap, 
    Homey, 
    HomeyMap, 
    LogMap, 
    OAuthUser, 
    Session, 
    VariableEvent, 
    VariableMap, 
    Zone, 
    ZoneMap 
} from '$lib/types/Homey';
import type { DashboardMap } from '$lib/types/Dashboard';
import type Dashboard from '$lib/types/Dashboard';
import { driverId } from '$lib/constants';

function createHomeys() {
    const { subscribe, set, update } = writable({} as HomeyMap);

    return {
        subscribe,
        set,
        add: (h: Homey) => update((existing: HomeyMap) => {
            const result = {...existing};
            result[h.id] = h;

            return result;
        })
    };
}

function createBaseUrl() {
    return derived([homey, page], ([$homey, $page], set) => {
        if($homey !== undefined) {
            $homey.baseUrl.then(u => set(u))
        }
        else if(localStorage.homeyId !== undefined) {
            set(localStorage.homeyId);
        }
        else if(import.meta.env.VITE_HOMEY_URL) { // Inject development variables
            set(import.meta.env.VITE_HOMEY_URL);
        } else {
            set($page.url.origin);
        }
    });
}

function createDevices() {
    const { subscribe, set, update } = writable({} as DeviceMap);

    return {
        subscribe,
        set,
        onDevice: (patch: any) => update((existing: DeviceMap) => onDevice(existing, patch)),
        //onCapability: (deviceId: string, event: CapabilityEvent) => update((existing: DeviceMap) => onCapability(existing, deviceId, event))
    };
}

function onDevice(existing: DeviceMap, patch: any) : DeviceMap {
    const deviceId: string = patch.id;

    const copy = { ...existing };
    copy[deviceId] = { ...existing[deviceId], ...patch };

    return copy;
}

/*
function onCapability(existing: DeviceMap, deviceId: string, event: CapabilityEvent) : DeviceMap {
    const device = existing[deviceId];

    if(device !== undefined) {
        const capability = device.capabilitiesObj[event.capabilityId];

        if(capability !== undefined) {
            capability.value = event.value;
            capability.lastUpdated.setUTCMilliseconds(event.transactionTime);
        }
    }
    
    return { ...existing };
}
*/

function createVariables() {
    const { subscribe, set, update } = writable({} as VariableMap);

    return {
        subscribe,
        set,
        onUpdate: (patch: VariableEvent) => update((existing: VariableMap) => onVariable(existing, patch)),
    };
}

function onVariable(existing: VariableMap, patch: any) : VariableMap {
    const variableId: string = patch.id;

    const copy = { ...existing };
    copy[variableId] = { ...existing[variableId], ...patch };

    return copy;
}

function createBasicFlows() {
    const { subscribe, set, update } = writable({} as BasicFlowMap);

    return {
        subscribe,
        set,
        onCreate: (flow: BasicFlow) => update((existing: BasicFlowMap) => ({ ...existing })),
        onDelete: (flow: BasicFlow) => update((existing: BasicFlowMap) => { const copy = {...existing}; delete copy[flow.id]; return copy; })
    };
}

function createAdvancedFlows() {
    const { subscribe, set, update } = writable({} as AdvancedFlowMap);

    return {
        subscribe,
        set,
        onCreate: (flow: AdvancedFlow) => update((existing: AdvancedFlowMap) => ({ ...existing })),
        onDelete: (flow: AdvancedFlow) => update((existing: AdvancedFlowMap) => { const copy = {...existing}; delete copy[flow.id]; return copy; })
    };
}

function createZones() {
    const { subscribe, set, update } = writable({} as ZoneMap);

    return {
        subscribe,
        set
    };
}

export const user = writable(undefined as (OAuthUser | undefined));
export const homeys = createHomeys();
export const homey = writable(undefined as (Homey | undefined));
export const baseUrl = createBaseUrl();
export const session = writable(undefined as (Session | undefined));
export const scopes = derived(session, (s: Session) => s?.scopes ?? [], []);
export const devices = createDevices();
export const variables = createVariables();
export const flowFolders = writable({} as FlowFolderMap);
export const basicFlows = createBasicFlows();
export const advancedFlows = createAdvancedFlows();
export const zones = createZones();
export const insights = writable({} as (LogMap));

export const dashboards = derived(
    devices, 
    (d: DeviceMap) => Object.values(d)
        .filter(e => e.driverId === driverId)
        .reduce((existing: DashboardMap, dev: DeviceObj) => {
            const dashboard: Dashboard = {
                id: dev.data.id, // The custom device.data.id is used instead of the device.id, as the device id is not accessible for the installable app.
                source: 'homey',
                title: dev.name,
                items: dev.settings.items ?? []
            }
            existing[dashboard.id] = dashboard;

            return existing;
        }, {} as DashboardMap), 
    {} as DashboardMap);