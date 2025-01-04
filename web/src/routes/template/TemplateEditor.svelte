<script lang="ts">
    import type { Template_v1, TemplateArgument_v1 } from '$lib/types/Template';
    import { createEventDispatcher } from 'svelte';
    import { v4 as uuid } from 'uuid';

    import TextPicker from '$lib/components/TextPicker.svelte'
    import { mdiInformation, mdiTrashCan } from '$lib/components/icons';
    import Icon from '$lib/components/Icon.svelte';

    export let template: Template_v1;

    const dispatch = createEventDispatcher();

    let title: string;
    let args: TemplateArgument_v1[];
    let arg: TemplateArgument_v1 | undefined;

    $: onTemplate(template);
    $: onChange(title, args);

    function onTemplate(_template: Template_v1) {
        title = _template.title;
        args = _template.arguments ?? [];
        arg = args.length > 0 ? args[0] : undefined;
    }

    function onChange(
        _title: string,
        _arguments: TemplateArgument_v1[]
    ) {
        if(
            _title !== template.title ||
            _arguments !== template.arguments
        ) {
            template = { 
                ...template, 
                title: _title,
                arguments: _arguments
            };

            dispatch('template', template);
        }
    }

    function addArgument() {
        const a: TemplateArgument_v1 = {
            id: uuid().substring(0, 8),
            label: undefined,
            type: 'string',
            default: undefined
        }

        args = [...args, a];
    }

    function removeArgument(index: number) {
        args = args.filter((a, i) => i !== index);
    }

    function updateArgumentId(index: number, id: string) {
        const a = { ...args[index], id };
        const copy = [...args];
        copy[index] = a;

        args = copy;
    }

    function updateArgumentLabel(index: number, label: string) {
        const a = { ...args[index], label };
        const copy = [...args];
        copy[index] = a;

        args = copy;
    }

    function updateType(index: number, type: any) {
        const a = { ...args[index], type };
        const copy = [...args];
        copy[index] = a;

        args = copy;
    }
</script>

<div role="tablist" class="tabs tabs-bordered tabs-lg">
    <input type="radio" name="tabs" role="tab" class="tab" aria-label="Settings" checked={true} />
    <div role="tabpanel" class="tab-content pt-2">
        <TextPicker label="Title" placeholder="Title" value={title} on:value={e => title = e.detail} />

        <div class="flex justify-center mt-2">
            <button class="btn btn-ghost" on:click={() => addArgument()}>Add argument</button>
        </div>
        
        {#each args as a, index}
            <div class="collapse collapse-arrow bg-base-300 mt-2">
                <input type="radio" name="arguments" bind:group={arg} value={a} />
                <div class="collapse-title text-lg font-medium">{a.id}</div>
                <div class="collapse-content">
                    <TextPicker label="ID" placeholder="ID" value={a.id} on:value={e => updateArgumentId(index, e.detail)} />
                    <TextPicker label="Label" placeholder="" value={a.label} on:value={e => updateArgumentLabel(index, e.detail)} />
                    
                    <label class="form-control w-full">
                        <div class="label">
                            <span class="label-text">Type</span>
                        </div>
                        <select class="select w-full" value={a.type} on:change={e => updateType(index, e.currentTarget.value)} placeholder="Type">
                            {#if a.type === undefined}
                                <option value={undefined}></option>
                            {/if}
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="capabilityUri">Capability</option>
                            <option value="deviceId">Device</option>
                            <option value="imageId">Image</option>
                            <option value="iconId">Icon</option>
                        </select>
                    </label>
        
                    <div role="alert" class="alert mt-2">
                        <Icon data={mdiInformation} />
                        <span>This argument can be referenced in any child widget settings by writing: <code>${'{'}template.{a.id}{'}'}</code></span>
                    </div>
        
                    <button class="btn btn-warning btn-outline w-full mt-2" on:click={() => removeArgument(index)}><Icon data={mdiTrashCan} />Remove</button>
                </div>
            </div>
        {/each}
    </div>

    <input type="radio" name="tabs" role="tab" class="tab" aria-label="JSON" />
    <div role="tabpanel" class="tab-content pt-2">
        <textarea
            placeholder="JSON"
            class="textarea textarea-bordered w-full max-w-xs h-max"
            value={JSON.stringify(template)}
            rows="10"
        ></textarea>
    </div>
</div>