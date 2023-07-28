import type { Grid } from '$lib/types/Grid';
import { writable } from 'svelte/store';

function createEditing() {
    const { subscribe, set, update } = writable(false);

    return {
        subscribe,
        set,
        toggle: () => update((existing: boolean) => !existing)
    };
}

function createItems() {
    const { subscribe, set, update } = writable([]);

    return {
        subscribe,
        set,
    };
}

function createGrid() {
    const { subscribe, set, update } = writable({} as Grid);

    return {
        subscribe,
        set,
        gap: (g: number) => update((existing: Grid) => ({ ...existing, gaps: [g, g] }))
    };
}

export const editing = createEditing();
export const items = createItems();
export const grid = createGrid(); 