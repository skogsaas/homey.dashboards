<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Template_v1 } from '$lib/types/Store';
    import type { TemplateSettings_v1, TemplateSettingsArgument_v1 } from "./TemplateSettings";
    import { templates } from '$lib/stores/homey';

    import TextPicker from '$lib/components/TextPicker.svelte';
    import NumberPicker from '$lib/components/NumberPicker.svelte';
    import BooleanPicker from '$lib/components/BooleanPicker.svelte';
    import CapabilityPicker from '$lib/components/CapabilityPicker.svelte';
    import DevicePicker from '$lib/components/DevicePicker.svelte';
    import IconPicker from '$lib/components/IconPicker.svelte';
    

    export let settings: TemplateSettings_v1;

    const dispatch = createEventDispatcher();

    let settingsArgs: TemplateSettingsArgument_v1[];
    let template: Template_v1 | undefined;

    $: onSettings(settings);
    $: template = settings.templateId !== undefined ? $templates[settings.templateId] : undefined;
    $: templateArgs = template?.arguments ?? [];

    function onSettings(_settings: TemplateSettings_v1) {
        settingsArgs = _settings.arguments ?? [];
    }

    function getValue(argId: string) : any | undefined {
        return settingsArgs.find(a => a.argId === argId)?.value;
    }

    function setValue(argId: string, value: any) {
        const index = settingsArgs.findIndex(a => a.argId === argId);

        if(index === -1) {
            settingsArgs = [...settingsArgs, { argId, value }];
        } else {
            const arg = { ...settingsArgs[index], value };
            settingsArgs = [...settingsArgs];
            settingsArgs[index] = arg;
        }

        settings = { ...settings, arguments: settingsArgs };
        dispatch('settings', settings);
    }
</script>

{#each templateArgs as templateArg}
    {#if templateArg.type === 'string'}
        <TextPicker 
            label={templateArg.label ?? templateArg.id} 
            placeholder={templateArg.default ?? templateArg.id} 
            value={getValue(templateArg.id) ?? templateArg.default} 
            on:value={e => setValue(templateArg.id, e.detail)} 
        />
    {:else if templateArg.type === 'number'}
        <NumberPicker 
            label={templateArg.label ?? templateArg.id} 
            placeholder={templateArg.default ?? templateArg.id} 
            value={getValue(templateArg.id) ?? templateArg.default} 
            on:value={e => setValue(templateArg.id, e.detail)} 
        />
    {:else if templateArg.type === 'boolean'}
        <BooleanPicker 
            label={templateArg.label ?? templateArg.id}
            checked={getValue(templateArg.id) ?? templateArg.default} 
            on:checked={e => setValue(templateArg.id, e.detail)} 
        />
    {:else if templateArg.type === 'capabilityUri'}
        <CapabilityPicker 
            name={templateArg.label ?? templateArg.id}
            capabilityUri={getValue(templateArg.id) ?? templateArg.default}
            on:capabilityUri={e => setValue(templateArg.id, e.detail)} 
        />
    {:else if templateArg.type === 'deviceId'}
        <DevicePicker 
            name={templateArg.label ?? templateArg.id}
            deviceId={getValue(templateArg.id) ?? templateArg.default}
            on:deviceId={e => setValue(templateArg.id, e.detail)} 
        />
    {:else if templateArg.type === 'imageId'}
        <p>Not implemented: Image picker</p>
    {:else if templateArg.type === 'iconId'}
        <IconPicker 
            name={templateArg.label ?? templateArg.id}
            iconId={getValue(templateArg.id) ?? templateArg.default}
            on:iconId={e => setValue(templateArg.id, e.detail)} 
        />
    {/if}
{/each}