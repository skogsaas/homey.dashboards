export interface Homey {
    baseUrl: Promise<string>;

    apps: AppManager;
    devices: DeviceManager;
    flow: FlowManager;
    insights: InsightsManager;
    images: ImagesManager;
    sessions: SessionManager;
    system: SystemManager;
}

export interface AppManager extends Manager {

    getApps() : Promise<AppMap>;
    getApp(opts: { id: string }) : Promise<AppObj>;

    getAppSettings(opts: { id: string }) : Promise<AppSettingsObj>;
    getAppSetting(opts: { id: string, name: string }) : Promise<any>;
    setAppSetting(opts: { id: string, name: string, value: any }) : Promise<any>;
    unsetAppSetting(opts: { id: string, name: string }) : Promise<any>;
}

export interface DeviceManager extends Manager {
    getDevices() : Promise<DeviceMap>;
}

export interface FlowManager extends Manager {
    getFlows() : Promise<BasicFlowMap>;
    getAdvancedFlows(): Promise<AdvancedFlowMap>;

    triggerFlow(opts: { id: string }) : Promise<any>;
    triggerAdvancedFlow(opts: { id: string }) : Promise<any>;
}

export interface InsightsManager extends Manager {
    getLogEntries(opts: { id: string, uri: string, resolution?: string }) : Promise<any>;
}

export interface ImagesManager extends Manager {
    getImages() : Promise<any>;
}

export interface SessionManager extends Manager {
    getSessionMe() : Promise<Session>;
}

export interface SystemManager extends Manager {
    getSystemName() : Promise<string>;
}

export interface Manager extends Emitter {
    homey: Homey;
    uri: string;
}

export type AppMap = { [key: string]: AppObj; }
export type DeviceMap = { [key: string]: DeviceObj; }
export type CapabilityMap = { [key: string]: CapabilityObj; }
export type BasicFlowMap = { [key: string]: BasicFlow; }
export type AdvancedFlowMap = { [key: string]: AdvancedFlow; }

export interface Emitter {
    connect() : Promise<void>;
    disconnect(): void;
    on(event: string, callback: any) : void;
}

export interface AppObj extends Emitter {
    id: string;
    uri: string;

    call(opts: { method: 'GET'|'PUT'|'POST'|'DELETE', path: string, body: any }) : Promise<any>;
    get(opts: { path: string }): Promise<any>;
    put(opts: { path: string, body: any }): Promise<any>;
    post(opts: { path: string, body: any }): Promise<any>;
    delete(opts: { path: string }): Promise<any>;
}

export interface AppSettingsObj {
    id: string;

    on(event: string, callback: any) : void;
}

export interface DeviceObj extends Emitter {
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
    iconObj: IconObj;
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

    setCapabilityValue(opts: { capabilityId: string, deviceId: string, value: string|number|boolean, transactionId?: string, transactionTime?: number }) : Promise<any>;
}

export interface CapabilityObj {
    id: string;
    type: string;
    iconObj: IconObj;
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

export interface IconObj {
    id: string;
    url: string;
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

export interface LogEntries {
    id: string;
    uri: string;
    start: Date;
    end: Date;
    step: number;
    updatesIn: number;
    values: LogEntry[];
    lastValue: LogEntry;
}

export interface LogEntry {
    t: Date;
    v: number;
}

export interface Flow extends Emitter {
    id: string;
    name: string;
    enabled: boolean;
    broken: boolean;
    triggerable: boolean;
    folder: string;
}

export interface BasicFlow extends Flow {
    trigger: any;
    conditions: any[];
    actions: any[]
}

export interface AdvancedFlow extends Flow {
    cards: any[];
}

export interface Session {
    id: string;
    type: string;
    userId: string;
    userName: string;
    userAthomId: string;
    scopes: string[];
    intersectedScopes: string[];
    clientId: string;
    clientName: string
}