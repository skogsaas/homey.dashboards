<script lang="ts">
    import { editing } from '$lib/stores/dashboard';
    import type { Variable } from '$lib/types/Homey';
    
    import Boolean from '$lib/components/boolean/Boolean.svelte';
    import type { VariableSettings_v2 } from '../VariableSettings';
    import { homey } from '$lib/stores/homey';

    export let settings: VariableSettings_v2;
    export let variable: Variable;
    export let controllable: boolean;
    export let mode: 'card'|'view';
    
    let value: boolean;
    $: disabled = !controllable || $editing;

    $: onVariable(variable);
    $: onValue(value);

    function onVariable(c: Variable) {
        value = !!c.value;
    }

    async function onValue(v: boolean) {
        if(v !== variable?.value) {
            if(!disabled) {
                await setVariableValue(v)
            } else {
                value = !v;
            }
        }
    }

    async function setVariableValue(value: number|boolean|string) {
        await $homey.logic.updateVariable({ id: variable.id, variable: { value } });
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<div class:w-full={mode === 'view'} on:click={e => { if(!$editing) { e.stopPropagation(); } }}>
    {#if mode === 'card'}
        <Boolean
            variant={settings.boolean?.variant}
            bind:value={value}
            color={settings.boolean?.color}
            colorTrue={settings.boolean?.colorTrue}
            colorFalse={settings.boolean?.colorFalse}
            icon={settings.boolean?.iconId}
            iconTrue={settings.boolean?.iconTrueId}
            iconFalse={settings.boolean?.iconFalseId}
            {disabled}
        />
    {:else}
        <div class="flex flex-row items-center w-full">
            <h3>{settings.title ?? variable.name}</h3>
            <div class="mx-auto"></div>
            <Boolean
                variant={settings.boolean?.variant}
                bind:value={value}
                color={settings.boolean?.color}
                colorTrue={settings.boolean?.colorTrue}
                colorFalse={settings.boolean?.colorFalse}
                icon={settings.boolean?.iconId}
                iconTrue={settings.boolean?.iconTrueId}
                iconFalse={settings.boolean?.iconFalseId}
                {disabled}
            />
        </div>
    {/if}
</div>