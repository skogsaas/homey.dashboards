<script lang="ts">
    import type { ToggleSettings_v2 } from './ToggleSettings';
    import type { WidgetContext, WidgetDataObject, WidgetState } from '$lib/types/Widgets';
    import Icon from '$lib/components/Icon.svelte';
    import { getIcon } from '$lib/components/icons/utils';
    import { type Unsubscriber, type Writable, writable } from 'svelte/store';
    import { setStateValue } from '$lib/utils/bindings';
    import { baseUrl } from '$lib/stores/homey';
    
    export let settings: ToggleSettings_v2;
    export let context: WidgetContext;

    let label: Writable<string> = writable<string>();
    let icon: Writable<string|undefined> = writable<string|undefined>();
    let color: Writable<string> = writable<string>();
    let size: Writable<string> = writable<string>();
    let value: Writable<boolean> = writable<boolean>();

    let labelSubscription: Unsubscriber | undefined;
    let iconSubscription: Unsubscriber | undefined;
    let colorSubscription: Unsubscriber | undefined;
    let sizeSubscription: Unsubscriber | undefined;
    let valueSubscription: Unsubscriber | undefined;

    $: onContext(context);
    $: onSettings(settings);
    $: disabled = context.readonly || context.editable;
    $: colorClass = getColorClass($color);
    $: sizeClass = getSizeClass($size);

    function onContext(_context: WidgetContext) {
        const data: WidgetDataObject = {
            label: 'Toggle',
            type: 'widget',
            states: { 
                label: createLabelState(),
                icon: createIconState(),
                color: createColorState(),
                size: createSizeState(),
                value: createValueState()
            },
            events: {},
            actions: {}
        };

        // Inject this widgets data into the context.
        context.data[settings.id] = data;
    }

    function onSettings(_settings: ToggleSettings_v2) {
        labelSubscription = setStateValue(context, _settings.label, 'Toggle', label, labelSubscription);
        iconSubscription = setStateValue(context, _settings.icon, undefined, icon, iconSubscription);
        colorSubscription = setStateValue(context, _settings.color, 'default', color, colorSubscription);
        sizeSubscription = setStateValue(context, _settings.size, 'md', size, sizeSubscription);
        valueSubscription = setStateValue(context, _settings.value, false, value, valueSubscription);

        console.log(_settings);
    }

    function createLabelState() : WidgetState {
        return {
            label: 'Label',
            type: 'string',
            writable: true,
            value: label
        };
    }

    function createIconState() : WidgetState {
        return {
            label: 'Icon',
            type: 'icon',
            writable: true,
            value: icon
        };
    }

    function createColorState() : WidgetState {
        return {
            label: 'Color',
            type: 'enum',
            enums: {
                default: 'Default',
                neutral: 'Neutral',
                primary: 'Primary',
                secondary: 'Secondary',
                accent: 'Accent',
                info: 'Info',
                success: 'Success',
                warning: 'Warning',
                error: 'Error',
            },
            writable: true,
            value: color
        };
    }

    function createSizeState() : WidgetState {
        return {
            label: 'Size',
            type: 'enum',
            enums: {
                xs: 'Extra Small',
                sm: 'Small',
                md: 'Medium', // Default according to DaisyUI
                lg: 'Large'            
            },
            writable: true,
            value: size
        };
    }

    function createValueState() : WidgetState {
        return {
            label: 'Value',
            type: 'boolean',
            writable: true,
            value: value
        };
    }
    
    function getColorClass(_color: string) : string {
        switch (_color) {
            case 'neutral': return 'toggle-neutral';
            case 'primary': return 'toggle-primary';
            case 'secondary': return 'toggle-secondary';
            case 'accent': return 'toggle-accent';
            case 'info': return 'toggle-info';
            case 'success': return 'toggle-success';
            case 'warning': return 'toggle-warning';
            case 'error': return 'toggle-error';
            default: return '';
        }
    }

    function getSizeClass(_size: string) : string {
        switch (_size) {
            case 'xs': return 'toggle-xs';
            case 'sm': return 'toggle-sm';
            case 'md': return 'toggle-md'; // Default according to DaisyUI
            case 'lg': return 'toggle-lg';
            default: return '';
        }
    }
    
    function onClick() {
        if (!disabled) {
            value.change(!value);
        }
    }

</script>

<label class="label cursor-pointer flex flex-row items-center p-0">
    {#if $icon !== undefined && $icon.includes('/')}
        {#await $baseUrl then url}
            <span>
                <img class="w-8 h-8 m-1 dark:invert" src={url + $icon} alt={$icon} />
            </span>
        {/await}
    {:else if $icon !== undefined}
        <span>
            <Icon data={getIcon($icon)} />
        </span>
    {/if}

    <span class="flex-1 overflow-ellipsis">{$label}</span>

    <input type="checkbox" class="toggle {colorClass} {sizeClass}" {disabled} checked={$value} on:click={e => onClick()} />
</label>