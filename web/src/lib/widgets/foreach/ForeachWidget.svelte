<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { v4 as uuid } from 'uuid';

    import type { WidgetContext, WidgetSettings_v1 } from '$lib/types/Widgets';
    import type { ForeachSettings_v1 } from './ForeachSettings';
    import type { TemplateSettings_v1 } from '../template/TemplateSettings';

    import Widget from '$lib/widgets/Widget.svelte';
    import { devices, zones } from '$lib/stores/homey';
    import type { Zone } from '$lib/types/Homey';
    import DndSingle from '$lib/components/DndSingle.svelte';
    
    export let context: WidgetContext;
    export let settings: ForeachSettings_v1;

    const dispatch = createEventDispatcher();

    let items: any[];
    let child: WidgetSettings_v1 | undefined;
    let renderSettings: WidgetSettings_v1[];
    let renderContext: WidgetContext;

    $: onSettings(settings);
    $: renderSettings = onChildItems(child, items);
    $: renderContext = { ...context, editable: false };

    function onSettings(_settings: ForeachSettings_v1) {
        items = [];
        child = _settings.item;

        if(_settings.each !== undefined && _settings.in !== undefined && _settings.inArg !== undefined) {
            if(_settings.each === 'capability') {
                if(_settings.in === 'device') {
                    const device = $devices[_settings.inArg ?? ''];

                    if(device !== undefined) {
                        items = Object.keys(device.capabilitiesObj).map(key => device.capabilitiesObj[key]);
                    }
                } else if (_settings.in === 'zone') {
                    const zones = getZones(_settings.inArg);

                    items = Object
                        .values($devices)
                        .filter(device => zones.some(zone => zone.id === device.zone))
                        .flatMap(device => Object.keys(device.capabilitiesObj).map(key => device.capabilitiesObj[key]));
                }
            } else if(_settings.each === 'device') {
                if (_settings.in === 'zone') {
                    const zones = getZones(_settings.inArg);

                    items = Object
                        .values($devices)
                        .filter(device => zones.some(zone => zone.id === device.zone));
                }
            } else if(_settings.each === 'zone') {
                if (_settings.in === 'zone') {
                    items = getZones(_settings.inArg);
                }
            } else if(_settings.each === 'flow') {
                // TODO
            } else if(_settings.each === 'folder') {
                // TODO
            } else if(_settings.each === 'image') {
                // TODO
            }
        }
    }

    function onItem(_item: WidgetSettings_v1) {
        child = { ..._item };
        settings = { ...settings, item: child };

        dispatch('settings', settings);
    }

    function getZones(zoneId: string) : Zone[] {
        return Object.values($zones)
            .filter(zone => zone.parent === zoneId)
            .flatMap(zone => [zone, ...getZones(zone.id)]);
    }

    function updateWidget(_item: WidgetSettings_v1) {
        child = { ..._item };
        settings = { ...settings, item: child };

        dispatch('settings', settings);
    }

    function onChildItems(_child: WidgetSettings_v1 | undefined, _items: any[]) {
        return _items.map(item => transform(_child, item)) as WidgetSettings_v1[]
    }

    function transform(obj: any, item: any) : any {
        if(obj === undefined) return undefined;

        if(Array.isArray(obj)) {
            return (obj as any[]).map(a => transform(a, item));
        } else if(typeof obj === 'object') {
            const copy = { ...obj };

            if(isWidget(copy)) {
                // Replace the ID of all sub widgets, as multiple instances of the sub widgets might collide if 
                // they have the same IDs.
                copy.id = uuid();

                if(copy.type === 'template') {
                    // Stop recursion if a template widget is detected. Instead only populate/replace template 
                    // arguments with arguments from this template.

                    (copy as TemplateSettings_v1).arguments = ((copy as TemplateSettings_v1).arguments ?? []).map(a => ({
                        argId: a.argId,
                        value: transform(a.value, item)
                    }));

                    return copy;
                }
            }

            Object.keys(copy).forEach(key => copy[key] = transform(copy[key], item));

            return copy;
        } else if(typeof obj === 'string') {
            let copy = obj as string;

            // Replace any template arguments being used.
            const variableRegex = /\$\{([^}]+)\.([^}]+)\}/g;
            const matches: string[][] = [...copy.matchAll(variableRegex)];

            // Require the variable to be in the form ${slug.property}
            const idSlug = settings.slug;

            for(const match of matches) {
                const fullMatch = match[0];
                const slug = match[1];
                const itemKey = match[2];

                if(slug !== idSlug) continue;

                if(Object.hasOwn(item, itemKey)) {
                    const itemValue = item[itemKey];
                    copy = copy.replaceAll(fullMatch, itemValue);
                }
            }

            return copy;
        } else {
            return obj;
        }
    }

    function isWidget(element: any) : boolean {
        return Object.hasOwn(element, 'id') &&
            Object.hasOwn(element, 'type') &&
            Object.hasOwn(element, 'version');
    }
</script>

{#if context.editable}
    <DndSingle 
        item={child}
        on:item={e => onItem(e.detail)} 
        editable={context.editable}
        class="w-full {context.editable ? 'min-h-[50px]' : ''}"
        let:item
    >
        <Widget {context} settings={item} on:settings={e => updateWidget(e.detail)} />
    </DndSingle>
{:else}
    {#each renderSettings as s}
        <Widget context={renderContext} settings={s} />
    {/each}
{/if}