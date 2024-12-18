<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { ForeachCondition_v1, ForeachSettings_v1 } from "./ForeachSettings";
    import { v4 as uuid } from 'uuid';

    import TextPicker from '$lib/components/TextPicker.svelte';
    import DevicePicker from '$lib/components/DevicePicker.svelte';
    import { mdiAlert, mdiInformation, mdiTrashCan } from '$lib/components/icons';
    import Icon from '$lib/components/Icon.svelte';
    import ZonePicker from '$lib/components/ZonePicker.svelte';
    import RandomObjectDropdown from '$lib/components/RandomObjectDropdown.svelte';
    import { generateItems, transform } from './foreachUtils';
    import { devices, zones } from '$lib/stores/homey';
    import type { ListSettings_v1 } from '../list/ListSettings';
    import StackInfo from '../list';
    
    export let settings: ForeachSettings_v1;

    const dispatch = createEventDispatcher();

    let slug: string;

    let eachType: 'capability' | 'device' | 'zone' | 'flow' | 'folder' | 'image' | undefined;

    let inType: 'device' | 'zone' | 'folder' | undefined;
    let inArg: string | undefined;

    let where: ForeachCondition_v1[];
    let whereOp: 'and' | 'or';
    let selectedWhereId: string | undefined;

    let gap: string;

    $: onSettings(settings);
    $: onEachType(eachType);
    $: onChange(slug, eachType, inType, inArg, where, whereOp, gap);

    function onSettings(_settings: ForeachSettings_v1) {
        slug = _settings.slug ?? _settings.id.substring(0, 8);

        eachType = _settings.each;

        inType = _settings.in;
        inArg = _settings.inArg;

        where = _settings.where ?? [];
        whereOp = _settings.whereOp ?? 'and';

        gap = _settings.gap ?? 'gap-0';
    }

    function onChange(
        _slug: any,
        _each: any,
        _in: any,
        _inArg: any,
        _where: any,
        _whereOp: any,
        _gap: any
    ) {
        if(_slug !== settings.slug ||
            _each !== settings.each ||
            _in !== settings.in ||
            _inArg !== settings.inArg ||
            _where !== settings.where ||
            _whereOp !== settings.whereOp ||
            _gap !== settings.gap
        ) {
            settings = {
                ...settings,
                slug: _slug,
                each: _each,
                in: _in,
                inArg: _inArg,
                where: _where,
                whereOp: _whereOp,
                gap: _gap
            };

            dispatch('settings', settings);
        }
    }

    function onEachType(_each: any) {
        if(_each !== settings.each) {
            inType = undefined;
            inArg = undefined;
        }
    }

    function addWhere() {
        const w: ForeachCondition_v1 = {
            id: uuid()
        }

        where = [...where, w];
        selectedWhereId = w.id;
    }

    function removeWhere(index: number) {
        where = where.filter((a, i) => i !== index);
    }

    function updateWhereKey(index: number, key: any) {
        where[index] = { ...where[index], key };
        where = [...where];
    }

    function updateWhereOperator(index: number, operator: any) {
        where[index] = { ...where[index], operator };
        where = [...where];
    }

    function updateWhereValue(index: number, value: any) {
        where[index] = { ...where[index], value };
        where = [...where];
    }

    function renderList() {
        var items = generateItems($devices, $zones, settings);
        var children = items.map(data => transform(settings.item, data, slug));

        var list: ListSettings_v1 = {
            ...StackInfo.create(),
            id: settings.id,
            items: children
        }

        console.log(list);

        settings = list;
        dispatch('settings', settings);
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
    <DevicePicker bind:deviceId={inArg} />
{:else if inType === 'zone'}
    <ZonePicker bind:zoneId={inArg} />
{:else if inType === 'folder'}
    <p>Flow folder picker not implemented!</p>
{/if}

{#if inArg !== undefined}
    <div class="flex justify-center my-1">
        <button class="btn btn-primary mt-2" on:click={() => addWhere()}>Add condition</button>
    </div>

    {#if where.length > 1} 
        <label class="form-control w-full">
            <div class="label">
                <span class="label-text">Mode</span>
            </div>
            <select class="select w-full mt-4" bind:value={whereOp} placeholder="Mode">
                <option value="and">AND</option>
                <option value="or">OR</option>
            </select>
        </label>
    {/if}

    {#each where as w, index}
        {#if index > 0}
            <div class="divider capitalize">{whereOp}</div>
        {/if}    

        <div class="collapse collapse-arrow bg-base-300 mt-2">
            <input type="radio" name="cases" bind:group={selectedWhereId} value={w.id} />
            <div class="collapse-title text-lg font-medium">
                <span class="text-secondary">{w.key ?? ''}</span>
                <span class="italic">{w.operator ?? ''}</span>
                <span class="text-accent">{w.value ?? ''}</span></div>
            <div class="collapse-content">
                <label class="form-control w-full">
                    <div class="label">
                        <span class="label-text">Where</span>
                    </div>
                    <select class="select w-full mt-4" value={w.key} on:change={e => updateWhereKey(index, e.currentTarget.value)} placeholder="Where">
                        {#if w.key === undefined}
                            <option value={undefined}></option>
                        {/if}
            
                        {#if eachType === 'capability'}
                            <option value="type">Type</option>
                            <option value="title">Title</option>
                        {/if}
                        
                        {#if eachType === 'device'}
                            <option value="class">Class</option>
                            <option value="virtualClass">Virtual class</option>
                            <option value="driverId">DriverID</option>
                        {/if}
            
                        {#if eachType === 'flow'}
                            <option value="enabled">Enabled</option>
                            <option value="broken">Broken</option>
                            <option value="triggerable">Triggerable</option>    
                        {/if}
                    </select>
                </label>

                <label class="form-control w-full">
                    <div class="label">
                        <span class="label-text">Operator</span>
                    </div>
                    <select class="select w-full" value={w.operator} on:change={e => updateWhereOperator(index, e.currentTarget.value)} placeholder="Where">
                        <option value="equal">Equal</option>
                        <option value="not-equal">Not equal</option>
                        <option value="starts-with">Starts with</option>
                        <option value="contains">Contains</option>
                        <option value="ends-with">Ends with</option>
                    </select>
                </label>

                <TextPicker bind:value={w.value} label="Value" placeholder="Value" on:value={e => updateWhereValue(index, e.detail)} />

                <button class="btn btn-warning btn-outline w-full mt-2" on:click={() => removeWhere(index)}><Icon data={mdiTrashCan} />Remove</button>
            </div>
        </div>
    {/each}
{/if}

<label class="form-control w-full">
    <div class="label">
        <span class="label-text">Gap</span>
    </div>
    <select class="select" bind:value={gap}>
        <option value="gap-0">0 px</option>
        <option value="gap-0.5">2 px</option>
        <option value="gap-1">4 px</option>
        <option value="gap-2">8 px</option>
        <option value="gap-3">12 px</option>
        <option value="gap-4">16 px</option>
        <option value="gap-5">20 px</option>
        <option value="gap-6">24 px</option>
        <option value="gap-7">28 px</option>
        <option value="gap-8">32 px</option>
        <option value="gap-9">36 px</option>
        <option value="gap-10">40 px</option>
    </select>
</label>

<TextPicker bind:value={slug} label="Slug" placeholder={slug} />

<div role="alert" class="alert mt-2 bg-base-100">
    <Icon data={mdiInformation} />
    <p>
        All properties are available in the form: <br /><code>${'{'}{slug}{'.[property]}'}</code>.
        <br/>
        <RandomObjectDropdown type={eachType} />
    </p>
</div>

<div role="alert" class="alert mt-2 flex flex-col">
    <div>
        <p>
            This foreach can be replaced with a static list, if you want to customize it further. 
            <span class="text-warning">Note:</span> this is a non-reversable action!
        </p>
    </div>
    
    <button class="btn btn-error btn-outline" on:click={e => renderList()}>
        <Icon data={mdiAlert} />Replace with list
    </button>
</div>