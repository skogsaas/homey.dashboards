<script lang="ts">

import Icon from 'stwui/icon';

export let data: string;
export let color: string = 'currentColor';
export let size: string = '24px';

$: finalClass = 'btn group inline-flex justify-center outline-none border-none items-center active:hover:scale-95 border shadow-md bg-default hover:text-primary-hover rounded-full p-1 '
    + 'h-[' + size + '] w-[' + size + '] '
    + $$props.class;

</script>

<button on:pointerdown on:click class={finalClass}>
    <Icon data={data} color={color} />
</button>