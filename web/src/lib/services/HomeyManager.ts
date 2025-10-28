import { alerts } from "$lib/stores/alerting";
import { settable, trigger } from "$lib/stores/events";
import { advancedFlows, basicFlows, connection, dataObjects, devices, flowFolders, images, insights, session, variables, zones, } from "$lib/stores/homey";
import type { AdvancedFlow, BasicFlow, CapabilityEvent, Homey, VariableEvent } from "$lib/types/Homey";
import type { WidgetDataObject } from "$lib/types/Widgets";
import { type Writable, writable } from "svelte/store";

export class HomeyManager {
    private homey: Homey;
    private scopes: string[] = [];

    constructor(_homey: Homey) {
        this.homey = _homey;

        this.homey.on('connect', (e: any) => connection.set('connect'));
        this.homey.on('disconnect', (e: any) => connection.set('disconnect'));
        this.homey.on('error', (e: any) => connection.set('error'));
        this.homey.on('reconnect', (e: any) => connection.set('reconnect'));
        this.homey.on('reconnect_attempt', (e: any) => connection.set('reconnect_attempt'));
        this.homey.on('reconnecting', (e: any) => connection.set('reconnecting'));
        this.homey.on('reconnect_error', (e: any) => connection.set('reconnect_error'));
        this.homey.on('connect_error', (e: any) => connection.set('connect_error'));
    }

    destroy() : void {
        this.homey.off('connect', (e: any) => connection.set('connect'));
        this.homey.off('disconnect', (e: any) => connection.set('disconnect'));
        this.homey.off('error', (e: any) => connection.set('error'));
        this.homey.off('reconnect', (e: any) => connection.set('reconnect'));
        this.homey.off('reconnect_attempt', (e: any) => connection.set('reconnect_attempt'));
        this.homey.off('reconnecting', (e: any) => connection.set('reconnecting'));
        this.homey.off('reconnect_error', (e: any) => connection.set('reconnect_error'));
        this.homey.off('connect_error', (e: any) => connection.set('connect_error'));
    }

    async loadAsync() {
        await this.loadSessionAsync();
        const t1 = this.loadDevicesAsync();
        const t2 = this.loadFlowsAsync();
        const t3 = this.loadInsightsAsync();
        const t4 = this.loadVariablesAsync();
        const t5 = this.loadZonesAsync();
        const t6 = this.loadImagesAsync();

        await Promise.all([t1, t2, t3, t4, t5, t6]);
    }

    private async loadSessionAsync() {
        try {
            const s = await this.homey.sessions.getSessionMe();
            session.set(s);

            // Make a local copy of the scopes, as it is used when loading all the different resources.
            this.scopes = s.scopes;
        } catch (error) {
            alerts.error('Error!', 'Could not get current session: ' + error, 10000);
        } 
    }
  
    private async loadDevicesAsync() {
        try {
            if(this.scopes.includes('homey') || 
                this.scopes.includes('homey.device') || 
                this.scopes.includes('homey.device.readonly') || 
                this.scopes.includes('homey.device.control')
            ) {
                await this.homey.devices.connect();
                
                // Get all devices
                const _devices = await this.homey.devices.getDevices();
                devices.set(_devices);

                // Map devices to data objects
                const datas = Object.values(_devices).reduce((acc, d) => {
                    acc[d.uri] = {
                        label: d.name,
                        type: 'device',
                        parentId: d.zone,
                        states: {
                            name: { label: 'Name', type: 'string', writable: true, value: writable(d.name) },
                            driver: { label: 'Driver', type: 'string', writable: false, value: writable(d.driverId) },
                            class: { label: 'Class', type: 'string', writable: false, value: writable(d.class) },
                            virtualClass: { label: 'Virtual Class', type: 'string', writable: false, value: writable(d.class) },
                            available: { label: 'Available', type: 'boolean', writable: false, value: writable(d.available) },
                            unavailableMessage: { label: 'Unavailable Message', type: 'string', writable: false, value: writable(d.unavailableMessage) },
                            warningMessage: { label: 'Warning Message', type: 'string', writable: false, value: writable(d.warningMessage) },
                            ready: { label: 'Ready', type: 'boolean', writable: false, value: writable(d.ready) },
                            color: { label: 'Color', type: 'string', writable: false, value: writable(d.color) },
                        },
                        events: {},
                        actions: {}
                    };
                    return acc;
                }, {} as { [key: string]: WidgetDataObject });

                // For each device, add all capabilities as individual data objects.
                Object.values(_devices).forEach(d => {
                    Object.values(d.capabilitiesObj).reduce((acc, c) => {
                        acc[d.uri + ':' + c.id] = { 
                            label: c.title,
                            type: 'capability',
                            parentId: d.uri,
                            states: {
                                name: { label: 'Name', type: 'string', writable: false, value: writable<string>(c.title) },
                                value: { 
                                    label: 'Value', 
                                    type: c.type, 
                                    writable: c.setable, 
                                    value: settable<any>(c.value, async (v: any) => { 
                                        if(c.value === v) return v;
                                        
                                        console.log('Setting capability', c.id, 'of device', d.id, 'to', v);
                                        await this.homey.devices.setCapabilityValue({ capabilityId: c.id, deviceId: d.id, value: v }); 
                                        return v; 
                                    }),
                                    enums: c.type === 'enum' ? 
                                        c.values.reduce((acc, v) => { acc[v.id] = v.title; return acc; }, {} as { [key: string]: string }) : 
                                        undefined
                                },
                                lastUpdated: { label: 'Last Updated', type: 'number', writable: false, value: writable<number>(c.lastUpdated) },
                                iconUrl: { label: 'Icon URL', type: 'string', writable: false, value: writable<string|undefined>(c.iconObj?.url) }
                            },
                            events: {
                                updated: { 
                                    label: 'Capability value updated', 
                                    type: c.type, 
                                    trigger: trigger<any>()
                                }
                            },
                            actions: {
                                set: { 
                                    label: 'Set ' + c.title, 
                                    arguments: [{ id: 'value', label: 'Value', type: c.type }], 
                                    action: async (args: any) => {
                                        try {
                                            await d.setCapabilityValue({ capabilityId: c.id, deviceId: d.id, value: args.value });
                                        } catch(error) {
                                            alerts.error('Error!', 'Could not set capability value: ' + error, 10000);
                                        }
                                    }
                                }
                            }
                        };
                        return acc;
                    }, datas);
                });

                dataObjects.update(existing => ({ ...existing, ...datas }));

                console.log('Datas', datas);

                // Subscribe for device updates.
                this.homey.devices.on('device.update', (patch: any) => { 
                    devices.onUpdate(patch) 
                    const d = datas[patch.id];

                    // Update all states for the data object
                    Object
                        .keys(patch)
                        .filter(key => key !== 'id' && key !== 'uri')
                        .forEach(key => (d.states[key].value as Writable<any>).set(patch[key]));
                });

                // For each device, subscribe for capability changes.
                for(let deviceId in _devices) {
                    const device = _devices[deviceId];
                    
                    await device.connect();

                    device.on('capability', (event: CapabilityEvent) => {
                        const c = datas[device.uri + ':' + event.capabilityId];
                        (c.states.value.value as Writable<any>).set(event.value);
                        (c.states.lastUpdated.value as Writable<any>).set(event.transactionTime);
                        c.events.updated.trigger.trigger(event.value);

                        const capability = device.capabilitiesObj[event.capabilityId];

                        if(capability !== undefined) {
                            capability.value = event.value;
                            capability.lastUpdated = event.transactionTime;
                        }
                    });
                }
            }
        } catch(error) {
            alerts.error('Error!', 'Could not load devices: ' + error, 10000);
        }
    }
  
    private async loadVariablesAsync() {        
        try {
            if(this.scopes.includes('homey') || 
                this.scopes.includes('homey.logic') || 
                this.scopes.includes('homey.logic.readonly')
            ) {
                await this.homey.logic.connect();
                
                const _variables = await this.homey.logic.getVariables();
                variables.set(_variables);

                this.homey.logic.on('variable.update', (event: VariableEvent) => variables.onUpdate(event));
            }
        } catch(error) {
            alerts.error('Error!', 'Could not load variables: ' + error, 10000);
        }
    }
  
    private async loadFlowsAsync() {
        try {
            if(this.scopes.includes('homey') || 
                this.scopes.includes('homey.flow') || 
                this.scopes.includes('homey.flow.readonly') || 
                this.scopes.includes('homey.flow.start')
            ) {
                await this.homey.flow.connect()
                
                const _flowFolders = await this.homey.flow.getFlowFolders()
                flowFolders.set(_flowFolders);
                // TODO: Listen for changes to folders

                const _basicFlows = await this.homey.flow.getFlows();
                basicFlows.set(_basicFlows);

                // TODO: Listen for updates
                this.homey.flow.on('flow.create', (e: BasicFlow) => basicFlows.onCreate(e));
                this.homey.flow.on('flow.delete', (e: BasicFlow) => basicFlows.onDelete(e));
                
                const _advancedFlows = await this.homey.flow.getAdvancedFlows();
                advancedFlows.set(_advancedFlows);
    
                // TODO: Listen for updates
                this.homey.flow.on('advancedflow.create', (e: AdvancedFlow) => advancedFlows.onCreate(e));
                this.homey.flow.on('advancedflow.delete', (e: AdvancedFlow) => advancedFlows.onDelete(e));
            }
        } catch(error) {
            alerts.error('Error!', 'Could not load flows: ' + error, 10000);
        }
    }
  
    private async loadInsightsAsync() {
        try {
            if(this.scopes.includes('homey') || 
                this.scopes.includes('homey.insights') || 
                this.scopes.includes('homey.insights.readonly')
            ) {
                await this.homey.insights.connect();

                const _logs = await this.homey.insights.getLogs();
                insights.set(_logs);

                /* TODO:
                $homey.insights.on('log.create', (e: Log) => insights.onCreate(e));
                $homey.insights.on('log.update', (e: Log) => insights.onUpdate(e));
                $homey.insights.on('log.delete', (e: Log) => insights.onDelete(e));
                */
            }
        } catch(error) {
            alerts.error('Error!', 'Could not load insight logs: ' + error, 10000);
        }
    }
  
    private async loadImagesAsync() {        
        try {
            if(this.scopes.includes('homey') || 
                this.scopes.includes('homey.insights') || 
                this.scopes.includes('homey.insights.readonly')
            ) {
                await this.homey.images.connect();

                const _images = await this.homey.images.getImages();
                images.set(_images);
            }
        } catch(error) {
            alerts.error('Error!', 'Could not load images: ' + error, 10000);
        }
    }
  
    private async loadZonesAsync() {
        try {
            if(this.scopes.includes('homey') || 
                this.scopes.includes('homey.zone') || 
                this.scopes.includes('homey.zone.readonly')
            ) {    
                await this.homey.zones.connect();

                const _zones = await this.homey.zones.getZones();
                zones.set(_zones);
            
            /* TODO:
            $homey.zones.on('zone.create', (e: Zone) => zones.onCreate(e));
            $homey.zones.on('zone.delete', (e: Zone) => zones.onDelete(e));
            $homey.zones.on('zone.update', (e: Zone) => zones.onUpdate(e));
            */
            }
        } catch(error) {
            alerts.error('Error!', 'Could not load zones: ' + error, 10000);
        }
    }
}