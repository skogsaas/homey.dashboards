export interface Homey {
    id: string;
    baseUrl: Promise<string>;

    __io: any;

    apps: AppManager;
    devices: DeviceManager;
    flow: FlowManager;
    insights: InsightsManager;
    images: ImagesManager;
    logic: LogicManager;
    sessions: SessionManager;
    system: SystemManager;
    zones: ZoneManager;
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

    getDeviceSettingsObj(opts: { id: string }) : Promise<any>;
    setDeviceSettings(opts: { id: string, settings: object }) : Promise<any>;

    setCapabilityValue(opts: { deviceId: string, capabilityId: string, value: string|number|boolean }) : Promise<any>;
}

export interface FlowManager extends Manager {
    getFlowFolders() : Promise<any>;
    getFlows() : Promise<BasicFlowMap>;
    getAdvancedFlows(): Promise<AdvancedFlowMap>;

    triggerFlow(opts: { id: string }) : Promise<any>;
    triggerAdvancedFlow(opts: { id: string }) : Promise<any>;
}

export interface InsightsManager extends Manager {
    getLogs() : Promise<LogMap>;
    getLogEntries(opts: { id: string, uri: string, resolution?: string }) : Promise<LogEntries>;
}

export interface ImagesManager extends Manager {
    getImages() : Promise<any>;
}

export interface LogicManager extends Manager {
    getVariable(opts: { id: string }) : Promise<Variable>;
    getVariables() : Promise<VariableMap>;

    createVariable(opts: { variable: { name: string, type: string, value: string|number|boolean } }) : Promise<any>;
    updateVariable(opts: { id: string, variable: { name?: string, value?: string|number|boolean } }) : Promise<any>;
    deleteVariable(opts: { id: string }) : Promise<any>;
}

export interface SessionManager extends Manager {
    getSessionMe() : Promise<Session>;
}

export interface SystemManager extends Manager {
    getSystemName() : Promise<string>;
}

export interface ZoneManager extends Manager {
    getZone(opts: { id: string }) : Promise<Zone>;
    getZones() : Promise<ZoneMap>;
    updateZone() : Promise<any>;
}

export interface Manager extends Emitter {
    uri: string;
}

export type HomeyMap = { [key: string]: Homey; }
export type AppMap = { [key: string]: AppObj; }
export type DeviceMap = { [key: string]: DeviceObj; }
export type CapabilityMap = { [key: string]: CapabilityObj; }
export type FlowFolderMap = { [key: string]: FlowFolder; }
export type BasicFlowMap = { [key: string]: BasicFlow; }
export type AdvancedFlowMap = { [key: string]: AdvancedFlow; }
export type ZoneMap = { [key: string]: Zone; }
export type LogMap = { [key: string]: Log; }
export type VariableMap = { [key: string]: Variable; }

export interface Emitter {
    homey: Homey;
    
    connect() : Promise<void>;
    disconnect(): void;
    on(event: string, callback: any) : void;
    off(event: string, callback: any) : void;
    once(event: string, callback: any) : void;
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
    uri: string;
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
    step: number;
    lastUpdated: number;
    values: ({ id: string; title: string; })[];
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
    components: { id: string; capabilities: string[]; }[];
    componentsStartAt: number;
}

export interface CapabilityEvent {
    capabilityId: string;
    value: any;
    transactionId: string;
    transactionTime: number;
}

export interface VariableEvent {
    id: string;
    name: string;
    type: string;
    value: string;
}

export interface Variable extends Emitter {
    id: string;
    uri: string;
    name: string;
    type: string;
    value: string|boolean|number;
}

export interface Log extends Emitter {
    id: string;
    uri: string;
    ownerId: string;
    ownerUri: string;
    title: string;
    titleTrue: string | null;
    titleFalse: string | null;
    type: 'number' | 'boolean';
    units: string | null;
    decimals: number | null;
    lastValue: number | boolean;
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

export interface FlowFolder extends Emitter {
    id: string;
    name: string;
    parent: string;
    uri: string;
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

export interface Zone extends Emitter {
    id: string;
    uri: string;
    name: string;
    icon: string;
    parent: string;
    active: boolean;
    activeLastUpdated: string;
    activeOrigins: string[];
}

export interface OAuthUser {
    id: string;
    firstname: string;
    lastname: string;
    fullname: string;
    language: string;
    email: string;
    devices: OAuthDevice[];
    homeys: OAuthHomey[];
    avatar: OAuthUserAvatar;
    otpEnabled: boolean;
    subscriptions: any;
}

export interface OAuthDevice {
    id: string;
    appVersion: string;
    created: string;
    devMode: boolean;
    name: string;
    osVersion: string;
    platform: string;
    publicKey: string;
    token: string;
    updateD: string;
}

export interface OAuthHomey {
    id: string;
    apiVersion: number;
    apps: OAuthApp[];
    bridges: any[];
    geolocation: OAuthGeolocation;
    ipExternal: string;
    ipExternalCountry: string;
    ipInternal: string;
    language: string;
    licenses: any[];
    localUrl: string;
    localUrlSecure: string;
    manufacturedAt: string;
    model: string;
    modelName: string;
    name: string;
    platform: string;
    platformVersion: number;
    region: string;
    remoteUrl: string;
    remoteUrlForwarded: boolean | null;
    role: 'owner'|'manager'|'guest';
    softwareVersion: string;
    state: string;
    stateSince: string;
    users: OAuthHomeyUser[];

    authenticate() : Promise<Homey>;
}

export interface OAuthApp {
    id: string;
    version: string;
    channel: 'test'|'live';
}

export interface OAuthGeolocation {
    accuracy: number;
    latitude: number;
    longitude: number;
}

export interface OAuthHomeyUser {
    id: string;
    role: string;
}

export interface OAuthUserAvatar {
    small: string;
    medium: string;
    large: string;
}