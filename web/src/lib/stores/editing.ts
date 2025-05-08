import type { WidgetMenuContext, WidgetSettings_v1 } from '$lib/types/Widgets';
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
export const selection = writable<string|undefined>(undefined as string | undefined);
export const copying = writable(undefined as WidgetMenuContext | undefined);