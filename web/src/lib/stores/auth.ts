import { writable } from "svelte/store";

function createApiKey() {
    const { subscribe, set } = writable(localStorage.apikey);
    
    return {
        subscribe,
        set: (apikey: string|undefined) => {
            if(apikey !== undefined) {
                localStorage.apikey = apikey;
            } else {
                delete localStorage.apikey;
            }
            
            set(apikey); 
        }
    };
}

export const apiKey = createApiKey();
//export const oauth = createOauth();