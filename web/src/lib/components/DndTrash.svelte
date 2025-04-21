<script lang="ts">
    import { dndzone } from "svelte-dnd-action";

    const flipDurationMs = 300;

    let classes: string = ''
    export { classes as class };

    let empty: any[] = [];

    const dropTargetClasses = ['border-error', 'border-2', 'visible'];
    const dropTargetStyle = {};
</script>

<div
    class="{classes}"
    use:dndzone={{ items: empty, flipDurationMs, morphDisabled: false, dropTargetStyle, dropTargetClasses, centreDraggedOnCursor: true }}
>
    <slot></slot>
</div>