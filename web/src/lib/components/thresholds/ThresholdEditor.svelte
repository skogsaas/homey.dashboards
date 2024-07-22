<script lang="ts">
    import { v4 as uuid } from 'uuid';
    import type { Threshold } from "$lib/types/Widgets";
    import Icon from '$lib/components/Icon.svelte'
    import { mdiDelete, mdiPlus } from "../icons";
    import ThresholdLineEditor from "./ThresholdLineEditor.svelte";

    export let thresholds: Threshold[] | undefined;
    export let colorMode: 'rgb'|'rgba';
    export let min: number = Number.MIN_SAFE_INTEGER;
    export let max: number = Number.MAX_SAFE_INTEGER;

    $: sorted = (thresholds ?? createBase())
        .sort((a, b) => {
            if(a.value === b.value) return 0;
            if(a.value > b.value) return -1;
            return 1;
        });

    function setColor(threshold: Threshold, color: string) {
        let copy = [...sorted];
        const index = copy.findIndex(t => t.id === threshold.id);
        copy[index] = { ...threshold, color };

        thresholds = copy;
    }

    function setValue(threshold: Threshold, value: number) {
        let copy = [...sorted];
        const index = copy.findIndex(t => t.id === threshold.id);
        copy[index] = { ...threshold, value };

        thresholds = copy;
    }

    function add() {
        let value = 0;
        
        const first = sorted[0];

        if(first.value !== min) {
            value = first.value;
        }

        const threshold: Threshold = {
            id: uuid(),
            color: colorMode + '(255,255,255' + (colorMode === 'rgba' ? ',1' : '') + ')',
            value: value + 1
        };

        thresholds = [threshold, ...sorted];
    }

    function remove(threshold: Threshold) {
        thresholds = thresholds?.filter(t => t.id !== threshold.id);
    }

    function createBase() : Threshold[] {
        const threshold: Threshold = {
            id: uuid(),
            color: colorMode + '(255,255,255' + (colorMode === 'rgba' ? ',1' : '') + ')',
            value: min
        };

        thresholds = [threshold];

        return thresholds;
    }
</script>

<button class="btn" on:click={() => add()}>
    <Icon data={mdiPlus} />
    <span>Add threshold</span>
</button>

{#each sorted as threshold, i(threshold.id)}
    <div class="join w-full">
        <ThresholdLineEditor 
            value={threshold.value} 
            color={threshold.color} 
            on:value={e => setValue(threshold, e.detail)}
            on:color={e => setColor(threshold, e.detail)}
            {colorMode}
            {min}
            {max}
            base={i === (sorted.length - 1)} 
        />

        {#if i !== (sorted.length - 1)}
            <button class="btn" on:click={() => remove(threshold)}>
                <Icon data={mdiDelete} />
            </button>
        {/if}
    </div>
{/each}