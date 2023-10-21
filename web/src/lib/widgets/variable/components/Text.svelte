<script lang="ts">
    import { editing } from '$lib/stores/dashboard';
    import type { Variable } from '$lib/types/Homey';
    
    import {Input } from 'stwui';
    import type { VariableSettings_v1 } from '../VariableSettings';
    import { homey } from '$lib/stores/homey';
    import IconButton from '$lib/components/IconButton.svelte';
    import { mdiContentSave } from '$lib/components/icons';

    export let settings: VariableSettings_v1;
    export let variable: Variable;
    export let controllable: boolean;
    export let mode: 'card'|'view';
    
    let value: string;
    $: disabled = !controllable || $editing;

    $: onVariable(variable);

    function onVariable(c: Variable) {
        value = c.value as string;
    }

    async function saveValue() {
        if(value !== variable?.value) {
            if(!disabled) {
                await setVariableValue(value)
            }
        }
    }

    async function setVariableValue(value: number|boolean|string) {
        await $homey.logic.updateVariable({ id: variable.id, variable: { value } });
    }
</script>

<div class:w-full={mode === 'view'}>
    {#if mode === 'card'}
        <span class="whitespace-nowrap cursor-pointer">{value}</span>
    {:else}
        <div class="flex flex-row items-center w-full">
            <h3>{settings.title ?? variable.name}</h3>
            <div class="mx-auto"></div>
            <IconButton data={mdiContentSave} on:click={() => saveValue()} />
            <Input name="text" bind:value={value} {disabled} />
        </div>
    {/if}
</div>