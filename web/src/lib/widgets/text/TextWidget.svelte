<script lang="ts">
    import type { WidgetContext } from '$lib/types/Widgets';
    import type TextSettings from './TextSettings';
    
    export let settings: TextSettings;
    export let context: WidgetContext;

    $: text = settings?.text;
    $: size = settings?.size;
</script>

<div class="align-center">
    {#if text === undefined}
        <span>Text not configured</span>
    {:else}
        {#if size == 1}
            <h1 class="m-0">{text}</h1>
        {:else if size == 2}
            <h2 class="m-0">{text}</h2>
        {:else if size == 3}
            <h3 class="m-0">{text}</h3>
        {:else if size == 4}
            <h4 class="m-0">{text}</h4>
        {:else if size == 5}
            <h5 class="m-0">{text}</h5>
        {:else if size == 6}
            <h6 class="m-0">{text}</h6>
        {:else}
            <div>{text}</div>
        {/if}
    {/if}
</div>