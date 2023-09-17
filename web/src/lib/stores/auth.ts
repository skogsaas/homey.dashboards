import { writable } from "svelte/store";

function createApiKey() {
    const { subscribe, set } = writable(localStorage.apikey);
    
    return {
        subscribe,
        set: (apikey: string|undefined) => {
            localStorage.apikey = apikey;
            set(apikey); 
        }
    };
}

export const apiKey = createApiKey();
//export const oauth = createOauth();