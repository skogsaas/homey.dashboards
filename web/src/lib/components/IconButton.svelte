<script lang="ts">

import Icon from '$lib/components/Icon.svelte'
import { createEventDispatcher } from 'svelte';

export let data: string | undefined;
export let size: string = '24px';

const dispatcher = createEventDispatcher();

$: finalClass = 'btn group inline-flex justify-center outline-none border-none items-center border shadow-md bg-default rounded-full p-1 '
    + $$props.class;

</script>

<button 
    on:pointerdown 
    on:click|preventDefault|stopPropagation={e => dispatcher('click', e)} 
    class={finalClass}
    style="width:{size}px; height:{size}px;"
>
    <Icon data={data} />
</button>