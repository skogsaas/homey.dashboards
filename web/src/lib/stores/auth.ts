import { writable } from "svelte/store";

const { subscribe, set } = writable(localStorage.token);

function createAppToken() {
    return {
        subscribe,
        set: (token: string|undefined) => {
            localStorage.token = token;
            set(token); 
        }
    };
}

export const appToken = createAppToken();
export const homeyToken = writable<string>();