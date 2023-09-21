<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';

    import { mdiAlarm, mdiAlert, mdiArrowRight, mdiCheck } from '$lib/components/icons';
    import { editing } from '$lib/stores/dashboard';
    import type { CapabilityObj, DeviceObj } from '$lib/types/Homey';

    import Icon from 'stwui/icon';
    import List from 'stwui/list';
    import ButtonGroup from 'stwui/button-group';
    
    const dispatcher = createEventDispatcher();

    export let device: DeviceObj;
    export let capability: CapabilityObj;
    export let controllable: boolean;
    export let mode: 'item'|'view';

    let value: string | undefined;
    $: disabled = !controllable || $editing;

    $: onValue(value);

    onMount(() => {
        value = capability.value;
    })

    async function onValue(v: string | undefined) {
        if(capability.setable &&  v !== capability?.value && v !== undefined) {
            if(!disabled) {
                await device.setCapabilityValue({ 
                    deviceId: device.id,
                    capabilityId: capability.id,
                    value: v
                });
            }
        }
    }
</script>

{#if capability !== undefined}
    {#if mode === 'item'}
        <span class="whitespace-nowrap">{capability.value ?? '...'} {capability.units ?? ''}</span>
    {:else}
        <div class="flex flex-col w-full">
            <List>
                {#each capability.values as option}
                    <List.Item class="cursor-pointer" on:click={() => value = option.id}>

                        <List.Item.Content slot="content">
                            <List.Item.Content.Title slot="title" class="mx-auto">
                                {#if option.id === value}
                                    <b>{option.title}</b>
                                {:else}
                                    {option.title}
                                {/if}
                            </List.Item.Content.Title>
                        </List.Item.Content>
                    </List.Item>
                {/each}
            </List>
        </div>
    {/if}
{/if}