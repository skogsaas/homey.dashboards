<script lang="ts">
    import { variables, scopes } from '$lib/stores/homey';

    import type { Variable } from '$lib/types/Homey';
    
    import NumberVariable from './components/NumberVariable.svelte'
    import BooleanVariable from './components/BooleanVariable.svelte'
    import Textvariable from './components/TextVariable.svelte'
    
    import Icon from '$lib/components/Icon.svelte'

    import type { VariableSettings_v3 } from './VariableSettings';
    import { getIcon } from '$lib/components/icons/utils';
    import type { WidgetContext } from '$lib/types/Widgets';
    import type { GridStackWidget } from 'gridstack';
    
    export let gridItem: GridStackWidget;
    export let context: WidgetContext;
    export let settings: VariableSettings_v3;

    let variableId: string = '';
    let variable: Variable | undefined;

    $: onSettings(settings);

    $: variable = $variables[variableId];
    $: controllable = $scopes.includes('homey') || $scopes.includes('homey.logic');
    
    function onSettings(s: VariableSettings_v3) {
        variableId = s.variableId ?? '';
    }
</script>

{#if variable !== undefined}
    <div class="flex items-center justify-between w-full pl-1 pr-1 leading-normal cursor-pointer">
        {#if settings.iconId !== undefined}
            <Icon data={getIcon(settings.iconId)} class="mr-1" />
        {/if}

        <div class="font-extralight overflow-hidden overflow-ellipsis whitespace-nowrap flex-grow">
            {settings.title ?? variable.name}
        </div>

        {#if variable.type === 'number'}
            <NumberVariable {settings} {variable} {controllable} mode={'card'} />
        {:else if variable.type === 'boolean'}
            <BooleanVariable {settings} {variable} {controllable} mode={'card'} />
        {:else} 
            <Textvariable {settings} {variable} {controllable} mode={'card'} />
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
