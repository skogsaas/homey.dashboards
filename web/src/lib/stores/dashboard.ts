import type Dashboard from '$lib/types/Dashboard';
import { writable } from 'svelte/store';

function createEditing() {
    const { subscribe, set, update } = writable(false);

    return {
        subscribe,
        set,
        toggle: () => update((existing: boolean) => !existing)
    };
}

export const editing = createEditing();
export const dashboard = writable(undefined as (Dashboard | undefined));