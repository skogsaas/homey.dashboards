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
import type { Dashboard_v1, DashboardMap, Store_v1, StoreMap, Template_v1, TemplateMap } from '$lib/types/Store';
import type { Dashboard_v2 } from '$lib/types/Store';
import { driverId } from '$lib/constants';

import BuiltInTemplates from './builtin-templates.json';

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
        onUpdate: (patch: any) => update((existing: DeviceMap) => onDeviceUpdate(existing, patch)),
        //onCapability: (deviceId: string, event: CapabilityEvent) => update((existing: DeviceMap) => onCapability(existing, deviceId, event))
    };
}

function onDeviceUpdate(existing: DeviceMap, patch: any) : DeviceMap {
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
export const homey = writable<Homey|undefined>(undefined as (Homey | undefined));
export const baseUrl = createBaseUrl();
export const session = writable(undefined as (Session | undefined));
export const scopes = derived(session, (s: Session) => s?.scopes ?? [], []);

export const devices = createDevices();
export const devicesLoading = writable(false);

export const variables = createVariables();
export const variablesLoading = writable(false);

export const flowFolders = writable({} as FlowFolderMap);
export const flowFoldersLoading = writable(false);

export const basicFlows = createBasicFlows();
export const basicFlowsLoading = writable(false);

export const advancedFlows = createAdvancedFlows();
export const advancedFlowsLoading = writable(false);

export const zones = createZones();
export const zonesLoading = writable(false);

export const insights = writable({} as (LogMap));
export const insightsLoading = writable(false);

export const stores = derived(
    devices, 
    (device: DeviceMap) => Object.values(device)
        .filter(e => e.driverId === driverId)
        .reduce((existing: StoreMap, dev: DeviceObj) => {
            const settings = dev.settings;
            let store: Store_v1 = {
                id: dev.data.id, // Use the data.id as store id, and not the device.id
                version: 1,
                title: dev.name,
                dashboards: [],
                templates: []
            }

            if(settings.hasOwnProperty('items')) { // Dashboard_v1
                store.dashboards.push({ id: dev.data.id, title: dev.name, ...dev.settings });
            } else if(settings.hasOwnProperty('root')) { // Dashboard_v2
                store.dashboards.push({ id: dev.data.id, title: dev.name, ...dev.settings });
            } else if(settings.version !== undefined && settings.version === 1) {
                store = { ...store, ...settings };
            }

            existing[store.id] = store;

            return existing;
        }, {} as StoreMap), 
    {} as StoreMap);
export const storesLoading = derived(devicesLoading, (loading: boolean) => loading);

export const dashboards = derived(
    stores, 
    (store: StoreMap) => Object.values(store)
        .flatMap(store => store.dashboards)
        .reduce((existing: DashboardMap, dashboard: Dashboard_v2) => {
            existing[dashboard.id] = dashboard;
            return existing;
        }, {} as DashboardMap), 
    {} as DashboardMap);
export const dashboardsLoading = derived(devicesLoading, (loading: boolean) => loading);

export const templates = derived(
    stores, 
    (store: StoreMap) => Object.values(store)
        .flatMap(store => store.templates)
        .concat((BuiltInTemplates as Template_v1[]).map(t => { t.builtin = true; return t; })) // Add the built-in templates
        .reduce((existing: TemplateMap, template: Template_v1) => {
            existing[template.id] = template;
            return existing;
        }, {} as TemplateMap), 
    {} as TemplateMap);
export const templatesLoading = derived(devicesLoading, (loading: boolean) => loading);