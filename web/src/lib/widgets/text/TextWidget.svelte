<script lang="ts">
    import type TextSettings from './TextSettings';
    export let settings: TextSettings;

    $: text = settings?.text ?? '';
    $: size = settings?.size;
</script>

<div class="align-center">
    {#if size == 1}
        <h1 class="no-margin">{text}</h1>
    {:else if size == 2}
        <h2 class="no-margin">{text}</h2>
    {:else if size == 3}
        <h3 class="no-margin">{text}</h3>
    {:else if size == 4}
        <h4 class="no-margin">{text}</h4>
    {:else if size == 5}
        <h5 class="no-margin">{text}</h5>
    {:else if size == 6}
        <h6 class="no-margin">{text}</h6>
    {:else}
        <div>{text}</div>
    {/if}
</div>

<style>
    .no-margin {
        margin-top: 0px;
        margin-bottom: 0px;
    }

    .align-center {
        display: flex;
        height: 100%;
        justify-content: center;
        align-items: center;
    }
</style>