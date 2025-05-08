<script lang="ts">
    import type { GridSettings_v1 } from './GridSettings';
    import type { WidgetContext } from '$lib/types/Widgets';
    import type { GridItem_v2, GridOptions_v1 } from '$lib/types/Grid';
    import WidgetGrid from '$lib/components/grid/WidgetGrid.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { mdiPlus } from '$lib/components/icons';
    import CardInfo from '$lib/widgets/card';
    
    export let settings: GridSettings_v1;
    export let context: WidgetContext;

    let items: GridItem_v2[];
    let options: GridOptions_v1;

    $: onSettings(settings);

    function onSettings(_settings: GridSettings_v1) {
        items = settings.items ?? [];
        options = settings.options ??{ cellHeight: 50, column: 12, float: true };
    }

    function updateItems(_items: GridItem_v2[]) {
        items = [..._items];
        settings = { ...settings, items };

        context.update(settings);
    }

    function addCard() {
        const card = CardInfo.create();
        const item: GridItem_v2 = { id: settings.id, settings: card, position: {} };

        items = [...items, item];
        settings = { ...settings, items };

        context.update(settings);
    }
</script>

{#if context.editable}
    <div class="flex align-middle justify-center w-full py-2">
        <button class="btn btn-circle" on:click={e => addCard()}>
            <Icon data={mdiPlus} />
        </button>
        <div>Add card</div>
    </div>
{/if}

<WidgetGrid {options} {context} {items} on:items={e => updateItems(e.detail)} editable={context.editable} />