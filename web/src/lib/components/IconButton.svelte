<script lang="ts">

import Icon from 'stwui/icon';

export let data: string | undefined;
export let color: string = 'currentColor';
export let size: string = '24px';

$: finalClass = 'btn group inline-flex justify-center outline-none border-none items-center border shadow-md bg-default rounded-full p-1 '
    + 'h-[' + size + '] w-[' + size + '] '
    + $$props.class;

</script>

<button on:pointerdown on:click|stopPropagation class={finalClass}>
    <Icon size={size} data={data} color={color} />
</button>