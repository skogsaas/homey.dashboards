<script lang="ts">
    import type { ButtonSettings_v1 } from './ButtonSettings';
    import type { WidgetContext, WidgetDataObject, WidgetEvent, WidgetState, WidgetStateBinding } from '$lib/types/Widgets';

    import { type Unsubscriber, type Writable, writable } from 'svelte/store';
    import { type Triggerable, trigger } from '$lib/stores/events';
    import Icon from '$lib/components/Icon.svelte';
    import { getIcon } from '$lib/components/icons/utils';
    import { setStateValue } from '$lib/utils/bindings';
    
    export let settings: ButtonSettings_v1;
    export let context: WidgetContext;

    let label: Writable<string> = writable<string>();
    let icon: Writable<string|undefined> = writable<string|undefined>();
    let style: Writable<string> = writable<string>();
    let color: Writable<string> = writable<string>();
    let size: Writable<string> = writable<string>();
    let clicked: Triggerable<void> = trigger<void>();

    let labelSubscription: Unsubscriber | undefined;
    let iconIdSubscription: Unsubscriber | undefined;
    let styleSubscription: Unsubscriber | undefined;
    let colorSubscription: Unsubscriber | undefined;
    let sizeSubscription: Unsubscriber | undefined;

    $: onContext(context);
    $: onSettings(settings);
    $: disabled = context.readonly || context.editable;
    $: styleClass = getStyleClass($style);
    $: colorClass = getColorClass($color);
    $: sizeClass = getSizeClass($size);

    function onContext(_context: WidgetContext) {
        const data: WidgetDataObject = {
            label: 'Button',
            type: 'widget',
            states: { 
                label: createLabelState(),
                icon: createIconState(),
                style: createStyleState(),
                color: createColorState(),
                size: createSizeState()
            },
            events: {
                clicked: createClickedEvent()
            },
            actions: {}
        };

        // Inject this widgets data into the context.
        context.data[settings.id] = data;
    }

    function onSettings(_settings: ButtonSettings_v1) {
        labelSubscription = setStateValue(context, _settings.label, 'Button', label, labelSubscription);
        iconIdSubscription = setStateValue(context, _settings.icon, undefined, icon, iconIdSubscription);
        styleSubscription = setStateValue(context, _settings.style, 'default', style, styleSubscription);
        colorSubscription = setStateValue(context, _settings.color, 'default', color, colorSubscription);
        sizeSubscription = setStateValue(context, _settings.size, 'md', size, sizeSubscription);
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

    function createStyleState() : WidgetState {
        return {
            label: 'Style',
            type: 'enum',
            enums: {
                default: 'Default',
                outline: 'Outline',
                dash: 'Dashed',
                soft: 'Soft',
                ghost: 'Ghost',
                link: 'Link',
            },
            writable: true,
            value: style
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

    function createClickedEvent() : WidgetEvent {
        return {
            label: 'Clicked',
            description: 'Triggered when the button is clicked',
            type: 'void',
            trigger: clicked
        }
    }

    function getStyleClass(_type: string) : string {
        switch (_type) {
            case 'outline': return 'btn-outline';
            case 'dash': return 'btn-dash';
            case 'soft': return 'btn-soft';
            case 'ghost': return 'btn-ghost';
            case 'link': return 'btn-link';
            default: return '';
        }
    }
    
    function getColorClass(_color: string) : string {
        switch (_color) {
            case 'neutral': return 'btn-neutral';
            case 'primary': return 'btn-primary';
            case 'secondary': return 'btn-secondary';
            case 'accent': return 'btn-accent';
            case 'info': return 'btn-info';
            case 'success': return 'btn-success';
            case 'warning': return 'btn-warning';
            case 'error': return 'btn-error';
            default: return '';
        }
    }

    function getSizeClass(_size: string) : string {
        switch (_size) {
            case 'xs': return 'btn-xs';
            case 'sm': return 'btn-sm';
            case 'md': return 'btn-md'; // Default according to DaisyUI
            case 'lg': return 'btn-lg';
            default: return '';
        }
    }
    
    function onClick() {
        if (!disabled) {
            clicked.trigger();
        }
    }
</script>

<button class="btn {styleClass} {colorClass} {sizeClass}" {disabled} on:click={e => onClick()}>
    {#if $icon !== undefined}
        <Icon data={getIcon($icon)} extraClass="mr-2" />
    {/if}
    
    {$label}
</button>