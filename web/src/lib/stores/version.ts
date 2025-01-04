import { writable } from "svelte/store";

function createVersion() {
    const { subscribe, set } = writable(localStorage.version);
    
    return {
        subscribe,
        set: (version: string|undefined) => {
            if(version !== undefined) {
                localStorage.version = version;
            } else {
                delete localStorage.version;
            }
            
            set(version); 
        }
    };
}

export const version = createVersion();