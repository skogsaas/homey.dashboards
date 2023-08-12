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

/*
function createOauth() {
    const { subscribe, set } = writable(JSON.parse(localStorage.oauth));
    
    return {
        subscribe,
        set: (oauth: string|undefined) => {
            localStorage.oauth = JSON.stringify(oauth);
            set(oauth); 
        }
    };
}
*/

export const apiKey = createApiKey();
//export const oauth = createOauth();