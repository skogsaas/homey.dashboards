import { alerts } from "$lib/stores/alerting";
import { advancedFlows, advancedFlowsLoading, basicFlows, basicFlowsLoading, connection, devices, devicesLoading, flowFolders, flowFoldersLoading, images, imagesLoading, insights, insightsLoading, session, sessionLoading, variables, variablesLoading, zones, zonesLoading } from "$lib/stores/homey";
import type { AdvancedFlow, BasicFlow, CapabilityEvent, Homey, VariableEvent } from "$lib/types/Homey";

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

        this.loadDevicesAsync();
        this.loadFlowsAsync();
        this.loadInsightsAsync();
        this.loadVariablesAsync();
        this.loadZonesAsync();
        this.loadImagesAsync();
    }

    private async loadSessionAsync() {
        sessionLoading.set(true);

        try {
            const s = await this.homey.sessions.getSessionMe();
            session.set(s);

            // Make a local copy of the scopes, as it is used when loading all the different resources.
            this.scopes = s.scopes;
        } catch (error) {
            alerts.error('Error!', 'Could not get current session: ' + error, 10000);
        } 

        sessionLoading.set(false);
    }
  
    private async loadDevicesAsync() {
        devicesLoading.set(true);

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

                // Subscribe for device updates.
                this.homey.devices.on('device.update', (patch: any) => devices.onUpdate(patch));
    
                // For each device, subscribe for capability changes.
                for(let deviceId in _devices) {
                    const device = _devices[deviceId];
                    
                    await device.connect();

                    device.on('capability', (event: CapabilityEvent) => {
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
    
        devicesLoading.set(false);
    }
  
    private async loadVariablesAsync() {
        variablesLoading.set(true);
        
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

        variablesLoading.set(false);
    }
  
    private async loadFlowsAsync() {
        flowFoldersLoading.set(true);
        basicFlowsLoading.set(true);
        advancedFlowsLoading.set(true);
        
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

        flowFoldersLoading.set(false);
        basicFlowsLoading.set(false);
        advancedFlowsLoading.set(false);
    }
  
    private async loadInsightsAsync() {
        insightsLoading.set(true);

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

        insightsLoading.set(false);
    }
  
    private async loadImagesAsync() {
        imagesLoading.set(true);
        
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

        imagesLoading.set(false);
    }
  
    private async loadZonesAsync() {
        zonesLoading.set(true);

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

        zonesLoading.set(false);
    }
}