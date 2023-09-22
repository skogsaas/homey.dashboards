<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';

    import { mdiAlarm, mdiAlert, mdiArrowRight, mdiCheck } from '$lib/components/icons';
    import { editing } from '$lib/stores/dashboard';
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';

    import Icon from 'stwui/icon';
    import Slider from 'stwui/slider';
    import ButtonGroup from 'stwui/button-group';
    
    const dispatcher = createEventDispatcher();

    export let settings: Capability_v3;
    export let device: DeviceObj;
    export let capability: CapabilityObj;
    export let controllable: boolean;
    export let mode: 'item'|'view';

    let targetValue: number;
    $: disabled = !controllable || $editing;

    $: postfix = capability.id.indexOf('.') > -1 ? capability.id.slice(capability.id.indexOf('.')) : '';

    $: measureTemperature = capability.id === ('measure_temperature' + postfix) ? capability : device.capabilitiesObj['measure_temperature' + postfix];
    $: targetTemperature = capability.id === ('target_temperature' + postfix) ? capability : device.capabilitiesObj['target_temperature' + postfix];
    $: thermostatMode = capability.id === ('thermostat_mode' + postfix) ? capability : device.capabilitiesObj['thermostat_mode' + postfix];

    $: onTargetTemperature(targetTemperature);
    $: onThermostatMode(thermostatMode);
    $: onTargetValue(targetValue);

    onMount(() => {
        onThermostatMode(thermostatMode);
    });

    function onTargetTemperature(c: CapabilityObj) {
        targetValue = c.value;
    }

    function onThermostatMode(c: CapabilityObj) {
        if(thermostatMode === undefined) {
            return;
        }

        if(c.value === 'cool') {
            dispatcher('style', 'bg-gradient-to-r from-cyan-400 to-cyan-600 border-none');
        } else if(c.value === 'heat') {
            dispatcher('style', 'bg-gradient-to-r from-orange-400 to-orange-600 border-none');
        } else if(c.value === 'auto') {
            dispatcher('style', 'bg-gradient-to-r from-cyan-400 to-orange-600 border-none');
        } else {
            dispatcher('style', '');
        }
        
    }

    function onTargetValue(v: number) {
        if(capability.setable &&  v !== capability?.value) {
            if(!disabled) {
                setCapabilityValue(capability.id, v);
            }
        }
    }

    async function setMode(value: string) {
        thermostatMode.value = value;
        await setCapabilityValue(thermostatMode.id, value);
    }

    async function setCapabilityValue(capabilityId: string, value: number|boolean|string) {
        await device.setCapabilityValue({ 
            deviceId: device.id,
            capabilityId,
            value
        });
    }
</script>

{#if capability !== undefined}
    {#if mode === 'item'}
        <span class="whitespace-nowrap">{capability.value ?? '...'} {capability.units ?? ''}</span>
    {:else}
        <div class="flex flex-col w-full">
            <div class="flex flex-row mx-auto">
                {#if measureTemperature !== undefined}
                    <div class="flex flex-col items-center">
                        <h1>{measureTemperature.value ?? '...'} {measureTemperature?.units ?? ''}</h1>
                        <span>Current temperature</span>
                    </div>
                {/if}
                
                {#if measureTemperature !== undefined && targetTemperature !== undefined}
                    <Icon size="48px" data={mdiArrowRight} class="ml-4 mr-4" />
                {/if}

                {#if targetTemperature !== undefined}
                    <div class="flex flex-col items-center">
                        <h1>{targetValue ?? '...'} {targetTemperature?.units ?? ''}</h1>
                        <span>Target temperature</span>
                    </div>
                {/if}
            </div>

            {#if thermostatMode !== undefined}
                <ButtonGroup class="mx-auto mt-4 mb-4">
                    {#each thermostatMode.values as value}
                        <ButtonGroup.Button on:click={() => setMode(value.id)} active={thermostatMode.value === value.id} >
                            {value.title}
                        </ButtonGroup.Button>    
                    {/each}
                </ButtonGroup>
            {/if}

            {#if targetTemperature !== undefined}
                <div class="flex flex-row mt-4">
                    <span class="whitespace-nowrap mr-4">{targetTemperature.min} {targetTemperature.units ?? ''}</span>
                    <Slider 
                        class="w-full"
                        bind:value={targetValue}
                        min={targetTemperature.min} 
                        max={targetTemperature.max} 
                        step={targetTemperature.step}
                        disabled={disabled} 
                    />
                    <span class="whitespace-nowrap ml-4">{targetTemperature.max} {targetTemperature.units ?? ''}</span>
                </div>
            {/if}
        </div>
    {/if}
{/if}