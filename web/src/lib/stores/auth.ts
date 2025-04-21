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

function createHomeyId() {
    const { subscribe, set } = writable(localStorage.homeyId);
    
    return {
        subscribe,
        set: (homeyId: string|undefined) => {
            if(homeyId !== undefined) {
                localStorage.homeyId = homeyId;
            } else {
                delete localStorage.homeyId;
            }
            
            set(homeyId); 
        }
    };
}

export const apiKey = createApiKey();
export const homeyId = createHomeyId();
//export const oauth = createOauth();