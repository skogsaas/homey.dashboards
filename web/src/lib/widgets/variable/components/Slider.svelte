<script lang="ts">
    import { editing } from '$lib/stores/dashboard';
    import type { Variable } from '$lib/types/Homey';
    
    import Slider from 'stwui/slider';
    import type { VariableSettings_v1 } from '../VariableSettings';
    import { homey } from '$lib/stores/homey';

    export let settings: VariableSettings_v1;
    export let variable: Variable;
    export let controllable: boolean;
    export let mode: 'card'|'view';
    
    let value: number;
    $: disabled = !controllable || $editing;

    $: onVariable(variable);
    $: onValue(value);

    function onVariable(c: Variable) {
        value = c.value as number;
    }

    async function onValue(v: number) {
        if(v !== variable?.value) {
            if(!disabled) {
                await setVariableValue(v)
            }
        }
    }

    async function setVariableValue(value: number|boolean|string) {
        await $homey.logic.updateVariable({ id: variable.id, variable: { value } });
    }
</script>

{#if mode === 'card'}
    <span class="whitespace-nowrap cursor-pointer">{value} {settings.number?.unit ?? ''}</span>
{:else}
    <div class="flex flex-col w-full">
        <div class="mx-auto">
            <div class="flex flex-col items-center">
                <h1>{value} {settings.number?.unit ?? ''}</h1>
                <span>{settings.title ?? variable.name}</span>
            </div>
        </div>

        <div class="flex flex-row mt-4">
            <span class="whitespace-nowrap mr-4">{settings.number?.min ?? ''} {settings.number?.unit ?? ''}</span>
            <Slider 
                class="w-full"
                bind:value={value}
                min={settings.number?.min} 
                max={settings.number?.max} 
                step={settings.number?.step}
                disabled={disabled} 
            />
            <span class="whitespace-nowrap ml-4">{settings.number?.max ?? ''} {settings.number?.unit ?? ''}</span>
        </div>
    </div>
{/if}