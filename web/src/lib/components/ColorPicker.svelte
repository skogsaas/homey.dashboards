<script lang="ts">
    import TailwindColors from './TailwindColors.json'
    
    export let value: string | undefined;
    export let mode: 'rgb' | 'rgba' = 'rgb';
    
    let classes = 'btn btn-circle w-8';
    export { classes as class };
    
    let modal: HTMLDialogElement;
    
    let rgb: string | undefined = undefined;
    let alpha: number = 1;

    $: names = Object.keys(TailwindColors);
    $: onValue(value);

    function onValue(_value: string | undefined) {
        if(_value !== undefined) {
            if(mode === 'rgba') {
                var result = /^rgba\((.+),(.+),(.+),(.+)\)$/i.exec(_value);
        
                const r = parseInt(result![1]);
                const g = parseInt(result![2]);
                const b = parseInt(result![3]);
                const a = parseFloat(result![4]);

                rgb = '#' + r.toString(16) + g.toString(16) + b.toString(16);
                alpha = a;
            } else {
                rgb = value;
                alpha = 1;
            }
        } else {
            rgb = undefined;
            alpha = 1;
        }
    }

    function getColors(name: string) : string[] {
        return (TailwindColors as any)[name] as string[];
    }

    function selectColor(color: string) {
        if(mode === 'rgb') {
            value = color;
        } else { // rgba
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            
            value = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
        }
    }
</script>

<button 
    on:click={() => modal.showModal()}
    style="background-color: {value}; opacity: {alpha * 100};"
    class={classes}
    class:border-border={value === undefined}
    class:border-2={value === undefined}
>
    &nbsp;
</button>

<dialog bind:this={modal} class="modal">
    <div class="modal-box flex flex-col">
        <div class="flex-shrink-0 mb-2">            
            <div class="flex flex-row w-full justify-between mb-4">
                <span>Opacity</span>
                <input type="range" bind:value={alpha} min="0" max="1" step="0.01" class="w-[440px] mx-2">
            </div>
        </div>
        
        <div class="flex-grow overflow-auto">
            {#each names as name}
                <div class="flex flex-row w-full justify-between">
                    <span class="font-thin">{name}</span>

                    <div>
                        {#each getColors(name) as color, i}
                            <button 
                                on:click={() => selectColor(color)}
                                style="background-color: {color}; opacity: {alpha * 100}%;" 
                                class="w-8 h-8 border-solid border-primary"
                                class:mx-2={i === 5} 
                                class:border-border={rgb === color}
                                class:border-4={rgb === color}
                            >
                                &nbsp;
                            </button>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>

        <div class="flex-shrink-0 mt-4">
            <form method="dialog" class="flex justify-end w-full mb-4">
                <button class="btn">
                    <div class="badge badge-primary badge-lg" style="background-color: {rgb}; border-color: {rgb}; opacity: {alpha * 100}%;"></div>    
                    <span>Select</span>
                </button>
            </form>
        </div>
    </div>
</dialog>