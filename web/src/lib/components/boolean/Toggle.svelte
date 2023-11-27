<script lang="ts">
    import { Icon } from 'stwui'
    import { getIcon } from '../icons/utils';

    export let value: boolean;
    export let disabled: boolean = false;

    export let icon: string | undefined = undefined;
    export let iconTrue: string | undefined = undefined;
    export let iconFalse: string | undefined = undefined;

    export let color: string | undefined = undefined;
    export let colorTrue: string | undefined = undefined;
    export let colorFalse: string | undefined = undefined;

    const defaultColor = "currentColor";

    $: currentIconTrue = (iconTrue ?? icon) ? getIcon(iconTrue ?? icon ?? '') : undefined;
    $: currentIconFalse = (iconFalse ?? icon) ? getIcon(iconFalse ?? icon ?? '') : undefined;

    $: width = (iconTrue ?? icon) || (iconFalse ?? icon) ? 'w-[48px]' : 'w-[2.8rem]';
	$: translate =
		value === true && ((iconTrue ?? icon) || (iconFalse ?? icon))
			? 'translate-x-[calc(100%+0.1rem)]'
			: value !== true
                ? 'translate-x-[0.1rem]'
                : 'translate-x-[calc(100%-0.1rem)]';

    function setValue(v: boolean) {
        if(!disabled) {
            value = v === true;
        }
    }
</script>

<div class="flex items-center">
    <div
        class="border relative inline-flex flex-shrink-0 h-[1.6rem] rounded-full cursor-pointer outline-none focus:outline-none {width}"
        class:border-border={value !== true}
        class:border-primary={value === true}
    >
        <button
            aria-label="toggle"
            on:click={() => setValue(!value)}
            type="button"
            class="relative inline-flex items-center justify-between flex-shrink-0 h-full w-full border-2 border-transparent rounded-full cursor-pointer ease-in-out outline-none focus:outline-none"
            class:bg-default={value !== true}
            class:bg-primary={value === true}
        >
            <span
                aria-hidden="true"
                class="relative z-10 inline-block bg-surface h-5 w-5 rounded-full shadow transform transition-transform ease-in-out duration-150 border border-border {translate}"
            />
            {#if currentIconTrue !== undefined}
                <span
                    class="text-sm absolute left-0.5 flex items-center justify-center h-4 w-4"
                >
                    <Icon data={currentIconTrue} color={colorTrue ?? color ?? defaultColor} />
                </span>
            {/if}
            {#if currentIconFalse !== undefined}
                <span
                    class="text-sm absolute right-0.5 flex items-center justify-center h-4 w-4"
                >
                    <Icon data={currentIconFalse} color={colorFalse ?? color ?? defaultColor} />
                </span>
            {/if}
        </button>
    </div>
</div>