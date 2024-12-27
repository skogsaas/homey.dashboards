<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { SectionsSettings_v1 } from './SectionsSettings';
    import GapPicker from '$lib/components/GapPicker.svelte';
    import GridColsPicker from '$lib/components/GridColsPicker.svelte';

    export let settings: SectionsSettings_v1;

    const dispatch = createEventDispatcher();

    let sm: string;
    let smGap: string;

    let md: string;
    let mdGap: string;

    let lg: string;
    let lgGap: string;

    let xl: string;
    let xlGap: string;

    let xxl: string;
    let xxlGap: string;

    $: onSettings(settings);
    $: onChange(sm, smGap, md, mdGap, lg, lgGap, xl, xlGap, xxl, xxlGap);

    function onSettings(s: SectionsSettings_v1) {
        sm = settings.sm ?? 'grid-cols-1';
        md = settings.md ?? 'grid-cols-2';
        lg = settings.lg ?? 'grid-cols-3';
        xl = settings.xl ?? 'grid-cols-4';
        xxl = settings.xxl ?? 'grid-cols-5';

        smGap = settings.smGap ?? 'gap-2';
        mdGap = settings.mdGap ?? 'gap-2';
        lgGap = settings.lgGap ?? 'gap-2';
        xlGap = settings.xlGap ?? 'gap-2';
        xxlGap = settings.xxlGap ?? 'gap-2';
    }

    function onChange(
        _sm: any, _smGap: any,
        _md: any, _mdGap: any,
        _lg: any, _lgGap: any,
        _xl: any, _xlGap: any,
        _xxl: any, _xxlGap: any
    ) {
        if(
            _sm !== settings.sm || _smGap !== settings.smGap ||
            _md !== settings.md || _smGap !== settings.mdGap ||
            _lg !== settings.lg || _smGap !== settings.lgGap ||
            _xl !== settings.xl || _smGap !== settings.xlGap ||
            _xxl !== settings.xxl || _smGap !== settings.xxlGap
        ) {
            settings = { 
                ...settings, 
                sm: _sm, smGap: _smGap,
                md: _md, mdGap: _mdGap,
                lg: _lg, lgGap: _lgGap,
                xl: _xl, xlGap: _xlGap,
                xxl: _xxl, xxlGap: _xxlGap, 
            };

            dispatch('settings', settings);
        }
    }
</script>

<div class="flex flex-col gap-2">
    <div class="">
        Adjust the number of columns and gaps based on screen sizes below.
    </div>
    
    <div class="collapse bg-base-300">
        <input type="radio" name="breakpoint" /> 
        <div class="collapse-title text-lg font-medium">Small: &gt; 640 px</div>
        <div class="collapse-content p-1"> 
            <GridColsPicker bind:value={sm} />
            <GapPicker bind:value={smGap} />    
        </div>
    </div>
    
    <div class="collapse bg-base-300">
        <input type="radio" name="breakpoint" /> 
        <div class="collapse-title text-lg font-medium">Medium: &gt; 768 px</div>
        <div class="collapse-content p-1"> 
            <GridColsPicker bind:value={md} />
            <GapPicker bind:value={mdGap} />
        </div>
    </div>
    
    <div class="collapse bg-base-300">
        <input type="radio" name="breakpoint" /> 
        <div class="collapse-title text-lg font-medium">Large: &gt; 1024 px</div>
        <div class="collapse-content p-1"> 
            <GridColsPicker bind:value={lg} />
            <GapPicker bind:value={lgGap} />
        </div>
    </div>
    
    <div class="collapse bg-base-300">
        <input type="radio" name="breakpoint" /> 
        <div class="collapse-title text-lg font-medium">X-Large: &gt; 1280 px</div>
        <div class="collapse-content p-1"> 
            <GridColsPicker bind:value={xl} />
            <GapPicker bind:value={xlGap} />
        </div>
    </div>
    
    <div class="collapse bg-base-300">
        <input type="radio" name="breakpoint" /> 
        <div class="collapse-title text-lg font-medium">XX-Large: &gt; 1536 px</div>
        <div class="collapse-content p-1"> 
            <GridColsPicker bind:value={xxl} />
            <GapPicker bind:value={xxlGap} />
        </div>
    </div>
</div>