<script lang="ts">
    import { widgets } from "$lib/widgets";
    import Icon from '$lib/components/Icon.svelte'

</script>

<div class="grid-stack-toolbar w-full h-full">
    {#each widgets as widget}
        <div class="grid-stack-toolbar-item grid-stack-item" widget-type={widget.type}>
            <div class="grid-stack-item-content w-full">
                <div class="flex flex-row py-1">
                    <Icon data={widget.icon} />
                    <span>{widget.label}</span>
                </div>
            </div>
        </div>
    {/each}
</div>