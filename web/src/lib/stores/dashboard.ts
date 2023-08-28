import type Dashboard from '$lib/types/Dashboard';
import type { Grid, GridResizeEvent } from '$lib/types/Grid';
import { writable } from 'svelte/store';

function createEditing() {
    const { subscribe, set, update } = writable(false);

    return {
        subscribe,
        set,
        toggle: () => update((existing: boolean) => !existing)
    };
}

function createGrid() {
    const { subscribe, set, update } = writable({
        gaps: [10, 10]
    } as Grid);

    return {
        subscribe,
        set,
        updateSize: (e: GridResizeEvent) => update((existing: Grid) => ({ ...existing, columns: e.cols, width: e.width, pxX: e.xPerPx, pxY: e.yPerPx })),
        updateGap: (g: number) => update((existing: Grid) => ({ ...existing, gaps: [g, g] }))
    };
}

export const editing = createEditing();
export const grid = createGrid(); 
export const dashboard = writable(undefined as (Dashboard | undefined));