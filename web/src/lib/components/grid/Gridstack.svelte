<script lang="ts">
  import type {
    GridItemHTMLElement,
    GridStack,
    GridStackNode,
    GridStackOptions,
    GridStackWidget,
  } from "gridstack";
  import { createEventDispatcher, onDestroy, onMount } from "svelte";

  import "gridstack/dist/gridstack-extra.min.css";
  import "gridstack/dist/gridstack.min.css";
  import "./Gridstack.css"

  import type { GridstackCallbackParams, GridstackDispatchEvents } from "./types";

  export let rootClass: string = 'grid-stack';
  export let itemClass: string = 'grid-stack-item';
  export let items: Array<GridStackWidget>;
  export let opts: GridStackOptions;

  const gridStackEvents = [
    "added",
    "change",
    "disable",
    "drag",
    "dragstart",
    "dragstop",
    "dropped",
    "enable",
    "removed",
    "resize",
    "resizestart",
    "resizestop",
    "resizecontent",
  ] as const;

  const dispatch = createEventDispatcher();

  let gridEl: HTMLDivElement;
  let grid: GridStack;

  onMount(async () => {
    const { GridStack } = await import("GridStack");
    grid = GridStack.init(opts, gridEl);

    GridStack.setupDragIn('.grid-stack-toolbar-item', { appendTo: 'body', helper: 'clone' });

    grid.on('dropped', (event: Event, previousNode: GridStackNode, newNode: GridStackNode) => { dispatch('dropped', ({ event, previousNode, newNode })) });
    grid.on('enable', (event: Event) => { dispatch('enable', event); });
    grid.on('disable', (event: Event) => { dispatch('disable', event); });
    grid.on('change', (event: Event, nodes: GridStackNode[]) => { dispatch('change', ({ event, nodes })); });
    grid.on('added', (event: Event, nodes: GridStackNode[]) => { dispatch('added', ({ event, nodes })); });
    grid.on('removed', (event: Event, nodes: GridStackNode[]) => { dispatch('removed', ({ event, nodes })); });
    grid.on('resizecontent', (event: Event, nodes: GridStackNode[]) => { dispatch('resizecontent', ({ event, nodes })); });
    grid.on('resizestart', (event: Event, el: GridItemHTMLElement) => { dispatch('resizestart', ({ event, el })); });
    grid.on('resize', (event: Event, el: GridItemHTMLElement) => { dispatch('resize', ({ event, el })); });
    grid.on('resizestop', (event: Event, el: GridItemHTMLElement) => { dispatch('resizestop', ({ event, el })); });
    grid.on('dragstart', (event: Event, el: GridItemHTMLElement) => { dispatch('dragstart', ({ event, el })); });
    grid.on('drag', (event: Event, el: GridItemHTMLElement) => { dispatch('drag', ({ event, el })); });
    grid.on('dragstop', (event: Event, el: GridItemHTMLElement) => { dispatch('dragstop', ({ event, el })); });
  });

  onDestroy(() => {
    grid?.offAll();
    grid?.destroy();
  });
</script>
  
<div bind:this={gridEl} class="{rootClass} w-full h-full">
  {#each items as item, index}
    <div 
      class={itemClass}
      gs-x={item.x}
      gs-y={item.y}
      gs-w={item.w}
      gs-h={item.h}
    >
      <div class="grid-stack-item-content">
        <slot {index} {item} />
      </div>
    </div>
  {/each}
</div>