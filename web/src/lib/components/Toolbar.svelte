<script lang="ts">
    import Icon from "./Icon.svelte";
    import { mdiMenu } from "./icons";
</script>

<div class="navbar sticky top-0 z-50 bg-base-200">
    <div class="navbar-start">
        <button class="btn btn-square btn-ghost">
            <Icon data={mdiMenu} />
        </button>

        {#if title !== undefined}
            <div class="hidden md:block">
                <button class="btn btn-ghost text-xl">{title}</button>
            </div>
        {/if}
    </div>

    <div class="navbar-center gap-2">
        <slot name="center"></slot>
    </div>

    <div class="navbar-end">
        <slot name="end"></slot>
    </div>
</div>