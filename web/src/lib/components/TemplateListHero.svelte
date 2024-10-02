<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    
    import { templates as homeyTemplates } from '$lib/stores/homey';
    import type { Template_v1 } from '$lib/types/Store';
    import Icon from './Icon.svelte';
    import { mdiPostageStamp } from './icons';

    let templates: Template_v1[];
    $: templates = Object.values({ ...$homeyTemplates });
</script>

<div class="hero bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse flex">
        <div class="text-center lg:text-left">
            <slot></slot>
        </div>
        
        <div class="card w-full max-w-sm shadow-2xl bg-base-100">
            {#if templates !== undefined && templates.length > 0}
                <div class="card w-96 bg-base-100 shadow-xl">
                    <div class="card-body">                                
                        {#each templates as template, i}
                            <button class="btn btn-ghost w-full" on:click={() => goto(base + '/template/?id=' + template.id)}>
                                <Icon data={mdiPostageStamp} />
                                {template.title}
                                <span class="mx-auto"></span>
                            </button>

                            {#if i < (templates.length - 1)}
                                <div class="divider divider-neutral my-1"></div>
                            {/if}
                        {/each}
                    </div>
                </div>
            {:else}
                <div class="text-center py-2">
                    <span class="text-6xl p-4 block">👻</span>
                    <span>No templates here. Only ghosts in the machine...</span>
                </div>
            {/if}
        </div>
    </div>
</div>