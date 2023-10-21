<script lang="ts">
    import { variables, scopes } from '$lib/stores/homey';

    import type { CapabilityEvent, Variable, VariableEvent } from '$lib/types/Homey';
    
    import Slider from './components/Slider.svelte'
    import Toggle from './components/Toggle.svelte'
    import Text from './components/Text.svelte'
    
    import Icon from 'stwui/icon';

    import type { VariableSettings_v1 } from './VariableSettings';
    import { getIcon } from '$lib/components/icons/utils';
    
    export let settings: VariableSettings_v1;
    export let mode: 'card'|'view';    

    let variableId: string = '';
    let variable: Variable | undefined;

    $: onSettings(settings);

    $: variable = $variables[variableId];
    $: controllable = $scopes.includes('homey') || $scopes.includes('homey.logic');
    
    function onSettings(s: VariableSettings_v1) {
        variableId = s.variableId ?? '';
    }
</script>

{#if variable !== undefined}
    <div class="flex items-center justify-between w-full pl-1 pr-1 leading-normal cursor-pointer">
        {#if mode === 'card'}
            {#if settings.iconId !== undefined}
                <Icon data={getIcon(settings.iconId)} class="mr-1" />
            {/if}

            <div class="font-extralight overflow-hidden overflow-ellipsis whitespace-nowrap flex-grow">
                {settings.title ?? variable.name}
            </div>
        {/if}

        {#if variable.type === 'number'}
            <Slider {settings} {variable} {controllable} {mode} />
        {:else if variable.type === 'boolean'}
            <Toggle {settings} {variable} {controllable} {mode} />
        {:else} 
            <Text {settings} {variable} {controllable} {mode} />
        {/if}
    </div>
{:else}
    <span class="w-full h-8 overflow-hidden overflow-ellipsis font-extralight">
        {#if settings.variableId !== undefined}
            Variable not found
        {:else}
            Variable not configured
        {/if}
    </span>
{/if}
