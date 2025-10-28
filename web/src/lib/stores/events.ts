import { type Invalidator, type Readable, type Subscriber, type Unsubscriber, writable } from "svelte/store";

export interface Triggerable<T> extends Readable<T> {
    trigger: (args: T) => void;
}

export interface Settable<T> extends Readable<T> {
    set: (value: T) => void;
    change: (value: T) => void;
}

export function trigger<T>() {
    const { subscribe, set } = writable<T>();

    return {
        subscribe: (run: Subscriber<T>, invalidate?: Invalidator<T>): Unsubscriber => {
            // Filter undefined values
            const filter = (value: T | undefined) => { 
                if(value !== undefined) run(value);
            };

            return subscribe(filter, invalidate);
        },
        trigger: (args: T) => { 
            set(args); 

            // Reset the store to undefined after triggering
            // This allows the next subscription to receive a new value
            set(undefined!); 
        },
    };
}

export function settable<T>(initialValue: T, onChange?: (value: T) => T) : Settable<T> {
    const { subscribe, set } = writable<T>(initialValue);

    return {
        subscribe,
        set,
        change: (value: T) => { onChange ? set(onChange(value)) : set(value);},
    };
}