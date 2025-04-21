import { derived, writable } from 'svelte/store';
import { page } from '$app/stores';

import type { 
    AdvancedFlow, 
    AdvancedFlowMap, 
    BasicFlow, 
    BasicFlowMap, 
    DeviceMap, 
    DeviceObj, 
    FlowFolderMap, 
    Homey, 
    HomeyMap, 
    ImageMap, 
    ImageObj, 
    LogMap, 
    OAuthUser, 
    Session, 
    VariableEvent, 
    VariableMap, 
    ZoneMap 
} from '$lib/types/Homey';
import type { Dashboard_v2, DashboardMap, Store_v1, StoreMap, Template_v1, TemplateMap } from '$lib/types/Store';
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
        else if(localStorage.homeyUrl !== undefined) {
            set(localStorage.homeyUrl);
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

function onDeviceUpdate(existingMap: DeviceMap, patch: any) : DeviceMap {
    const deviceId: string = patch.id;

    const copy = { ...existingMap };
    const device = copy[deviceId] as any;
    
    Object
        .keys(patch)
        .filter(key => key !== 'id' && key !== 'uri')
        .forEach(key => device[key] = patch[key]);

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

function onVariable(existingMap: VariableMap, patch: any) : VariableMap {
    const variableId: string = patch.id;
    const copy = { ...existingMap };
    const variable = copy[variableId] as any;

    Object
        .keys(patch)
        .filter(key => key !== 'id' && key !== 'uri')
        .forEach(key => variable[key] = patch[key]);

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

function createImages() {
    const { subscribe, set, update } = writable({} as ImageMap);

    return {
        subscribe,
        set,
        onCreate: (img: ImageObj) => update((existing: ImageMap) => ({ ...existing })),
        onDelete: (img: ImageObj) => update((existing: ImageMap) => { const copy = {...existing}; delete copy[img.id]; return copy; })
    };
}

export const user = writable(undefined as (OAuthUser | undefined));
export const homeys = createHomeys();
export const homey = writable<Homey|undefined>(undefined as (Homey | undefined));
export const connection = writable<'connect'|'disconnect'|'reconnect'|'error'|'reconnecting'|'reconnect_attempt'|'reconnect_error'|'connect_error'>('disconnect');
export const baseUrl = createBaseUrl();

export const session = writable(undefined as (Session | undefined));
export const scopes = derived(session, (s: Session) => s?.scopes ?? [], []);

export const devices = createDevices();
export const variables = createVariables();
export const flowFolders = writable({} as FlowFolderMap);
export const basicFlows = createBasicFlows();
export const advancedFlows = createAdvancedFlows();
export const zones = createZones();
export const images = createImages();
export const insights = writable({} as (LogMap));

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
                dashboards: (settings as Store_v1).dashboards ?? [],
                templates: (settings as Store_v1).templates ?? []
            }

            if(settings.hasOwnProperty('items')) { // Dashboard_v1
                store.dashboards.push({ ...settings, title: dev.name });
            } else if(settings.hasOwnProperty('root')) { // Dashboard_v2
                store.dashboards.push({ ...settings, title: dev.name });
            }

            existing[store.id] = store;

            return existing;
        }, {} as StoreMap), 
    {} as StoreMap);

export const dashboards = derived(
    stores, 
    (storeMap: StoreMap) => Object.values(storeMap)
        .flatMap(store => store.dashboards)
        .filter(dashboard => dashboard?.id)
        .reduce((existing: DashboardMap, dashboard: Dashboard_v2) => {
            existing[dashboard.id] = dashboard;
            return existing;
        }, {} as DashboardMap), 
    {} as DashboardMap);

export const templates = derived(
    stores, 
    (storeMap: StoreMap) => Object.values(storeMap)
        .flatMap(store => store.templates)
        .concat((BuiltInTemplates as unknown as Template_v1[]).map(t => { t.builtin = true; return t; })) // Add the built-in templates
        .reduce((existing: TemplateMap, template: Template_v1) => {
            existing[template.id] = template;
            return existing;
        }, {} as TemplateMap), 
    {} as TemplateMap);