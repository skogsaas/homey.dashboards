import type { WidgetContext, WidgetStateBinding } from "$lib/types/Widgets";
import type { Unsubscriber, Writable } from "svelte/store";

export function setStateValue<T>(
    context: WidgetContext,
    value: T | WidgetStateBinding, 
    defaultValue: T, 
    localState: Writable<T>, 
    unsubscriber: Unsubscriber | undefined
) : Unsubscriber | undefined {
    if(unsubscriber !== undefined) {
        unsubscriber();
    }

    if(typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        // This is not a binding, set it directly.
        localState.set(value || defaultValue);
    } else if (typeof value === 'object') {
        // This should be a binding to a "remote" state. Find the state referenced by the binding, and subscribe to it.
        const binding = value as WidgetStateBinding;
        const object = context.data[binding.objectId];

        if(object !== undefined) {
            const remoteState = object.states[binding.stateId];

            if(remoteState !== undefined) {
                const remoteUnsubscriber = remoteState.value.subscribe(v => {
                    localState.set(v);
                });

                const localUnsubscriber = localState.subscribe(v => {
                    remoteState.change(v);
                }
            }
        }
    } else {
        localState.set(defaultValue);
    }

    return undefined;
}