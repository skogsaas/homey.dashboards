import type { LoadEvent } from "@sveltejs/kit";


export async function load(event: LoadEvent) {
    return {
        dashboard: event.params.slug
    };
}