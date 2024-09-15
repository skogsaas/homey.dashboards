<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { ForeachSettings_v1 } from "./ForeachSettings";

    import TextPicker from '$lib/components/TextPicker.svelte';
    import NumberPicker from '$lib/components/NumberPicker.svelte';
    import BooleanPicker from '$lib/components/BooleanPicker.svelte';
    import CapabilityPicker from '$lib/components/CapabilityPicker.svelte';
    import DevicePicker from '$lib/components/DevicePicker.svelte';
    import IconPicker from '$lib/components/IconPicker.svelte';
    import { mdiInformation } from '$lib/components/icons';
    import Icon from '$lib/components/Icon.svelte';
    import ZonePicker from '$lib/components/ZonePicker.svelte';
    import RandomObjectDropdown from '$lib/components/RandomObjectDropdown.svelte';
    
    export let settings: ForeachSettings_v1;

    const dispatch = createEventDispatcher();

    let slug: string;

    let eachType: 'capability' | 'device' | 'zone' | 'flow' | 'folder' | 'image' | undefined;

    let inType: 'device' | 'zone' | 'folder' | undefined;
    let inArg: string | undefined;
    
    let whereKey: string | undefined; // Object property name
    let whereOp: 'equal' | 'not-equal' | 'starts-with' | 'contains' | 'ends-with' | undefined;
    let whereArg: string | undefined;

    $: onSettings(settings);
    $: onEachType(eachType);
    $: onChange(slug, eachType, inType, inArg, whereKey, whereOp, whereArg);

    function onSettings(_settings: ForeachSettings_v1) {
        slug = _settings.slug ?? _settings.id.substring(0, 8);

        eachType = _settings.each;

        inType = _settings.in;
        inArg = _settings.inArg;

        whereKey = _settings.where;
        whereOp = _settings.whereOp;
        whereArg = _settings.whereArg;
    }

    function onChange(
        _slug: any,
        _each: any,
        _in: any,
        _inArg: any,
        _where: any,
        _whereOp: any,
        _whereArg: any
    ) {
        if(_slug !== settings.slug ||
            _each !== settings.each ||
            _in !== settings.in ||
            _inArg !== settings.inArg ||
            _where !== settings.where ||
            _whereOp !== settings.whereOp ||
            _whereArg !== settings.whereArg
        ) {
            settings = {
                ...settings,
                slug: _slug,
                each: _each,
                in: _in,
                inArg: _inArg,
                where: _where,
                whereOp: _whereOp,
                whereArg: _whereArg
            };

            console.log(settings);

            dispatch('settings', settings);
        }
    }

    function onEachType(_each: any) {
        inType = undefined;
        inArg = undefined;
    }
</script>

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">For each</span>
    </div>
    <select class="select w-full mt-4" bind:value={eachType} placeholder="For each">
        {#if eachType === undefined}
            <option value={undefined}></option>
        {/if}

        <option value="capability">Capability</option>
        <option value="device">Device</option>
        <option value="zone">Zone</option>
        <option value="flow" disabled>⛔ Flow</option>
        <option value="folder" disabled>⛔ Flow folder</option>
        <option value="image" disabled>⛔ Image</option>
    </select>
</label>

{#if eachType !== undefined}
    <label class="form-control w-full">
        <div class="label">
            <span class="label-text">In</span>
        </div>
        <select class="select w-full mt-4" bind:value={inType} placeholder="In">
            {#if inType === undefined}
                <option value={undefined}></option>
            {/if}

            {#if eachType === 'capability'}
                <option value="device">Device</option>
            {/if}
            
            {#if eachType === 'device' || eachType === 'zone'}
                <option value="zone">Zone</option>
            {/if}

            {#if eachType === 'flow' || eachType === 'folder'}
                <option value="folder">Flow folder</option>
            {/if}
        </select>
    </label>
{/if}

{#if inType === 'device'}
    <DevicePicker bind:deviceUri={inArg} />
{:else if inType === 'zone'}
    <ZonePicker bind:zoneId={inArg} />
{:else if inType === 'folder'}
    <p>Flow folder picker not implemented!</p>
{/if}

<TextPicker bind:value={slug} label="Slug" placeholder={slug} />

<div role="alert" class="alert mt-2">
    <Icon data={mdiInformation} />
    <p>
        All properties are available in the form: <br /><code>${'{'}{slug}{'.[property]}'}</code>.
        <br/>
        <RandomObjectDropdown type={eachType} />
    </p>
</div>