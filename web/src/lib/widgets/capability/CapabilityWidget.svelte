<script lang="ts">
    import { devices, homey, scopes } from '$lib/stores/homey';
    import { editing } from '$lib/stores/dashboard';

    import type CapabilitySettings from './CapabilitySettings';
    import type { Capability_v3 } from './CapabilitySettings';

    import type { CapabilityEvent, CapabilityMap, CapabilityObj, DeviceObj } from '$lib/types/Homey';
    
    import Portal from 'stwui/portal';
    import Modal from 'stwui/modal';

    import Slider from './components/Slider.svelte';
    import Sensor from './components/Sensor.svelte';
    import Toggle from './components/Toggle.svelte';
    import Button from './components/Button.svelte';
    import Thermostat from './components/Thermostat.svelte';
    import Picker from './components/Picker.svelte';
    

    export let settings: CapabilitySettings;

    let viewOpen: boolean = false;
    let viewCapability: CapabilityObj | undefined;
    let viewClasses: string = '';

    let deviceId: string = '';
    let capabilities: Capability_v3[] = [];

    let device: DeviceObj;
    let capabilityMap: CapabilityMap = {};

    $: onSettings(settings);

    $: latestDevice = $devices[deviceId];
    $: controllable = $scopes.includes('homey') || $scopes.includes('homey.device') || $scopes.includes('homey.device.control');

    $: onDevice(latestDevice);

    function onSettings(s: CapabilitySettings) {
        deviceId = s.deviceId ?? '';
        capabilities = s.capabilities ?? []; 
    }

    function onDevice(d: DeviceObj) {
        // If the device changes, try to unsubscribe from events
        if(device !== undefined && device.off !== undefined) {
            device.off('capability', updateCapability);
        }

        if(d !== undefined) {
            device = d;

            capabilityMap = {...device.capabilitiesObj};

            if(device.on !== undefined) {
                device.on('capability', updateCapability);
            }
        }
    }

    function updateCapability(event: CapabilityEvent) {
        if(device !== undefined) {
            const capability = device.capabilitiesObj[event.capabilityId];

            if(capability !== undefined) {
                // Trigger an update
                capabilityMap = {...device.capabilitiesObj};
            }
        }
    }

    async function setCapabilityValue(capabilityId: string, value: number|boolean|string) {
        await device.setCapabilityValue({ 
            deviceId: device.id,
            capabilityId,
            value
        });
    }

    /*
    function getComponent(capability: CapabilityObj) {
        if(capability === undefined) 
        {
            return Sensor;
        }

        if(capability.setable) {
            switch(capability.type) {
                case 'boolean':
                    return capability.getable ? Toggle : Button;
                case 'number':
                    return Slider;
                case 'string': // TODO: Implement some kind of input for this
                default:
                    return Sensor;
            }
        }

        if(capability.getable) {
            switch(capability.type) {
                case 'boolean':
                case 'number':
                case 'string':
                default:
                    return Sensor;
            }
        }

        return Sensor;
    }
    */

    function getComponent(capability: CapabilityObj) {
        if(device !== undefined) {
            for(var component of device.ui.components) {
                if(component.capabilities.includes(capability.id)) {
                    switch(component.id) {
                        case 'slider':
                            return Slider;

                        case 'toggle':
                            return Toggle;

                        case 'button':
                            return Button;

                        case 'thermostat':
                            return Thermostat;

                        case 'picker':
                            return Picker;

                        case 'battery':
                        case 'color':
                        case 'media':                        
                        case 'ternary':
                        case 'sensor':
                        default:
                            return Sensor;
                    }
                }
            }
        }

        return Sensor;
    }

    function openView(capability: CapabilityObj) {
        if(!$editing) {
            viewClasses = '';
            viewCapability = capability;
            viewOpen = true;
        }
    }
</script>

<div class="flex items-center h-12">
    {#if device == undefined}
        {#if settings?.deviceId !== undefined}
            <span>Error</span>
        {/if}
    {:else}
        {#await $homey.baseUrl}
            ...
        {:then url}
            <img class="w-8 h-8 m-1 text-default" src={url + device?.iconObj.url} alt={device?.icon} />
        {/await}

        <span class="w-full overflow-hidden overflow-ellipsis">{device?.name}</span>
    {/if}
</div>

<div class="flex flex-col w-full overflow-hidden">
    {#if device === undefined}
        {#if settings.deviceId !== undefined}
            <span class="w-full h-8 overflow-hidden overflow-ellipsis">Device not found.</span>
        {/if}
    {:else}
        {#each capabilities as capability}
            {#if capabilityMap[capability.capabilityId] !== undefined}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                    class="flex items-center justify-between w-full pl-1 pr-1 leading-normal cursor-pointer"
                >
                    <div 
                        on:click={() => openView(capabilityMap[capability.capabilityId])} 
                        class="font-extralight overflow-hidden overflow-ellipsis whitespace-nowrap"
                    >
                        {capability.title ?? capabilityMap[capability.capabilityId].title}
                    </div>
                    
                    <svelte:component 
                        this={getComponent(capabilityMap[capability.capabilityId])} 
                        {device}
                        capability={capabilityMap[capability.capabilityId]} 
                        {controllable}
                        mode="item"
                        on:value={e => setCapabilityValue(capability.capabilityId, e.detail)}
                    />
                </div>
            {/if}
        {/each}
    {/if}
</div>

<Portal>
    {#if viewOpen && viewCapability !== undefined}
        <Modal handleClose={() => viewOpen = false}>
            <Modal.Content slot="content" class={viewClasses}>
                <Modal.Content.Header slot="header" class="w-full text-center border-none">{device.name}</Modal.Content.Header>
                <Modal.Content.Body slot="body">
                    <svelte:component 
                        this={getComponent(viewCapability)} 
                        {controllable}
                        {device}
                        capability={viewCapability} 
                        mode="view"
                        on:style={e => viewClasses = e.detail}
                        on:value={e => setCapabilityValue(viewCapability.id, e.detail)}
                    />
                </Modal.Content.Body>
                <Modal.Content.Footer slot="footer" class="w-full text-center border-none">
                    
                </Modal.Content.Footer>
            </Modal.Content>
        </Modal>
    {/if}
</Portal>