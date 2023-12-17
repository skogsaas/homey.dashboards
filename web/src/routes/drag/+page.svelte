<script lang="ts">
    import Grid from "$lib/components/grid/Grid.svelte";

    let items = [
        { id: 0, x: 2, y: 0, h: 2, w: 2 },
        { id: 1, x: 4, y: 2, h: 2, w: 2 }
    ];

    const columns: number = 24;
    const rowHeight: number = 24;
    const editable: boolean = true;
</script>

<Grid bind:items {columns} {rowHeight} {editable} let:item>
    ID: {item.id}
</Grid>
