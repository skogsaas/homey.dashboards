import { writable } from "svelte/store";

function createFavorite() {
    const { subscribe, set } = writable(localStorage.favorite);
    
    return {
        subscribe,
        set: (favorite: string|undefined) => {
            if(favorite !== undefined) {
                localStorage.favorite = favorite;
            } else {
                delete localStorage.favorite;
            }
            
            set(favorite); 
        }
    };
}

export const favorite = createFavorite();