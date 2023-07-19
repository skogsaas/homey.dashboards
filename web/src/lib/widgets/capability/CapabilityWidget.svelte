<script lang="ts">
    import Switch from '@smui/switch';
    import Slider from '@smui/slider';

    import WidgetHeaderBody from "../WidgetHeaderBody.svelte";

    import type CapabilitySettings from './CapabilitySettings';
    import type { DeviceMap, Homey } from '../../types/Homey';

    export let settings: CapabilitySettings;
    export let devices: DeviceMap;
    export let editing: boolean;
    export let homey: Homey;

    $: device = devices[settings.deviceId ?? ''];
    $: capability = device?.capabilitiesObj[settings.capabilityId ?? ''];
    $: value = capability?.value;

    async function setCapabilityValue(v: number|boolean|string) {
        await device.setCapabilityValue({ 
            capabilityId: capability.id,
            deviceId: device.id,
            value: v
        });
    }
</script>

<WidgetHeaderBody>
    <svelte:fragment slot="header">
        {#if device == undefined || capability == undefined}
            <span>Error</span>
        {:else}
            {#await homey.baseUrl}
                ...
            {:then url}
                <img class="widget-icon" src={url + device?.iconObj.url} alt={device?.icon} />
            {/await}

            <div>
                <div>{device?.name}</div>
                <div class="subtitle">{capability?.title}</div>
            </div>
            
            
        {/if}
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#if device == undefined || capability == undefined}
            {#if device == undefined}
                <span>Device not found.</span>
            {:else}
                <span>Capability not found.</span>
            {/if}
        {:else}
            {#if capability?.setable === true }
                {#if capability.type === 'boolean'}
                    <Switch 
                        style="align-self: center;" 
                        checked={value} 
                        on:SMUISwitch:change={(e) => setCapabilityValue(e.detail.selected)} 
                        disabled={editing} 
                    />
                {:else if capability.type === 'number'}
                    {#if capability.min !== undefined && capability.max !== undefined && capability.decimals !== undefined}
                        <Slider 
                            style="flex-grow: 1; align-self: center;" 
                            value={value} 
                            on:SMUISlider:change={(e) => setCapabilityValue(e.detail.value)} 
                            min={capability.min} 
                            max={capability.max} 
                            step={Math.pow(10, -1 * capability.decimals)} 
                            discrete 
                            disabled={editing} 
                        />
                    {:else}
                        <input type="number" min={capability.min} max={capability.max} disabled={editing} />
                    {/if}
                {/if}
            {:else}
                <h5 class="value">{capability?.value} {capability?.units}</h5>
            {/if}
        {/if}
    </svelte:fragment>
</WidgetHeaderBody>

<style>
.widget-icon {
    width: 42px;
    height: 42px;
    margin: 4px;
}

.subtitle {
    font-weight: lighter;
}

.value {
    flex-grow: 1;
    align-self: center;
    text-align: center;
    margin: 0;
}
</style>