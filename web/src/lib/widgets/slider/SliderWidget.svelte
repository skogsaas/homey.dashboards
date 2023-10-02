<script lang="ts">
    import { editing } from '$lib/stores/dashboard';
    import { devices, homey, scopes } from '$lib/stores/homey';
    import type { CapabilityObj } from '$lib/types/Homey';

    import type SliderSettings from './SliderSettings';

    import Slider from 'stwui/slider';
    
    export let settings: SliderSettings;
    export let mode: 'card'|'view';

    $: device = $devices[settings.deviceId ?? ''];
    $: capability = device?.capabilitiesObj ? device.capabilitiesObj[settings.capabilityId ?? ''] : undefined;

    $: controllable = $scopes.includes('homey') || $scopes.includes('homey.device') || $scopes.includes('homey.device.control');
    $: disabled = !controllable || $editing;

    let value: number;

    $: onCapability(capability);
    $: onValue(value);

    function onCapability(c: CapabilityObj | undefined) {
        value = c?.value ?? 0.0;
    }

    async function onValue(v: number) {
        if(capability !== undefined && v !== capability.value) {
            if(!disabled) {
                await setCapabilityValue(capability.id, v);
            }
        }
    }

    function formatValue(v: number | null | undefined) : string | undefined | null {
        if(v === null || v === undefined || capability === undefined) {
            return '';
        }

        if(capability.units === '%' || !capability.units) {
            return (100.0 / (capability.max - capability.min) * v).toFixed(0);
        }

        return v.toFixed(capability.decimals);
    }

    function getStep(c: CapabilityObj) : number {
        var value = c.step ?? Math.pow(0.1, c.decimals);

        if(c.decimals !== undefined) {
            value = Math.round(value * Math.pow(10, c.decimals)) / Math.pow(10, c.decimals);
        }

        return value;
    }

    async function setCapabilityValue(capabilityId: string, value: number|boolean|string) {
        await device.setCapabilityValue({ 
            deviceId: device.id,
            capabilityId,
            value
        });
    }
</script>

{#if capability === undefined}
    {#if settings.capabilityId !== undefined}
        <span>Capability not found</span>
    {:else}
        <span>Slider not configured</span>
    {/if}
{:else}
    <div class="flex flex-col w-full h-full pl-1 pr-1">
        <div class="mx-auto">
            <div class="flex flex-col items-center">
                <h1>{formatValue(value) ?? '...'} {capability?.units ?? '%'}</h1>
                <span>{settings?.title ?? capability.title}</span>
            </div>
        </div>

        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="flex flex-row mt-2">
            {#if !settings.hideMinMax}
                <span class="whitespace-nowrap mr-4">{formatValue(capability.min)} {capability.units ?? '%'}</span>
            {/if}

            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="w-full h-full" on:click|stopPropagation>
                <Slider 
                    class="w-full"
                    bind:value={value}
                    min={capability.min} 
                    max={capability.max} 
                    step={getStep(capability)}
                    disabled={disabled} 
                />
            </div>
            
            {#if !settings.hideMinMax}
                <span class="whitespace-nowrap ml-4">{formatValue(capability.max)} {capability.units ?? '%'}</span>
            {/if}
        </div>
    </div>
{/if}