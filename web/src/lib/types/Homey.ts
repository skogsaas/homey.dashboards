export interface Homey {
    baseUrl: Promise<string>;

    apps: AppManager;
    devices: DeviceManager;
}

export interface AppManager {
    connect() : void;
    disconnect(): void;
    on(event: string, callback: any) : void;

    getApps() : Promise<AppMap>;
    getApp(opts: { id: string }) : Promise<AppObj>;

    getAppSettings(opts: { id: string }) : Promise<AppSettingsObj>;
    getAppSetting(opts: { id: string, name: string }) : Promise<any>;
    setAppSetting(opts: { id: string, name: string, value: any }) : Promise<any>;
    unsetAppSetting(opts: { id: string, name: string }) : Promise<any>;
}

export interface DeviceManager {
    connect() : void;
    disconnect(): void;
    on(event: string, callback: any) : void;

    getDevices() : Promise<DeviceMap>;
}

export type AppMap = { [key: string]: AppObj; }
export type DeviceMap = { [key: string]: DeviceObj; }
export type CapabilityMap = { [key: string]: CapabilityObj; }

export interface AppObj {
    id: string;
    uri: string;
    connect() : void;
    disconnect(): void;
    on(event: string, callback: any) : void;

    call(opts: { method: 'GET'|'PUT'|'POST'|'DELETE', path: string, body: any }) : Promise<any>;
    get(opts: { path: string }): Promise<any>;
    put(opts: { path: string }): Promise<any>;
    post(opts: { path: string }): Promise<any>;
    delete(opts: { path: string }): Promise<any>;
}

export interface AppSettingsObj {
    id: string;

    on(event: string, callback: any) : void;
}

export interface DeviceObj {
    id: string;
    driverId: string;
    driverUri: string;
    ownerUri: string;
    name: string;
    node: string;
    zone: string;
    data: any;
    icon: string;
    iconOverride: any;
    iconObj: { id: string; url: string; }
    class: string;
    virtualClass: string;
    capabilities: string[]
    capabilitiesObj: CapabilityMap;
    settings: any;
    settingsObj: any;
    insights: InsightObj[];
    flags: any[];
    energy: any;
    energyObj: EnergyObj;
    ui: Ui;
    uiIndicator: string;
    available: boolean;
    unavailableMessage: string;
    warningMessage: string;
    ready: boolean;
    repair: boolean;
    unpair: boolean;
    images: Image[];
    color: string;

    connect() : Promise<void>;
    disconnect(): void;
    on(event: string, callback: any) : void;

    setCapabilityValue(opts: { capabilityId: string, deviceId: string, value: string|number|boolean, transactionId?: string, transactionTime?: number }) : Promise<any>;
}

export interface CapabilityObj {
    id: string;
    type: string;
    iconObj: any;
    title: string;
    getable: boolean;
    setable: boolean;
    insights: boolean;
    insightsTitleTrue: string;
    insightsTitleFalse: string;
    units: string;
    decimals: number;
    value: any;
    min: number;
    max: number;
    lastUpdated: Date;
}

export interface EnergyObj {
    W: number;
    batteries: string[];
    cumulative: boolean;
    generator: boolean;
    approximated: any;
}

export interface Image {
    id: string;
    type: string;
    title: string;
    imageObj: ImageObj;
}

export interface ImageObj {
    id: string;
    ownerUri: string;
    url: string;
    lastUpdated: number;
}

export interface InsightObj {
    id: string;
    uri: string;
    type: string;
    title: string;
    titleTrue: string;
    titleFalse: string;
    units: string;
    decimals: number;
}

export interface Ui {
    quickAction: string;
    components: { id: string; capabilities: string[]; }
    componentsStartAt: number;
}

export interface CapabilityEvent {
    capabilityId: string;
    value: any;
    transactionId: string;
    transactionTime: number;
}