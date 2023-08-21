<script lang="ts">
    import { devices, homey } from '$lib/stores/homey';

    import { Line } from 'svelte-chartjs';
    import 'chart.js/auto';
    import 'chartjs-adapter-date-fns';

    import type InsightSettings from './InsightSettings';
    import type { InsightObj } from '$lib/types/Homey';
    import CircularProgress from '@smui/circular-progress';

    export let settings: InsightSettings;

    let renderSettings: InsightSettings;
    let renderDeviceId: string | undefined;
    let renderInsightId: string | undefined;
    let renderInsight: InsightObj | undefined;
    let renderResolution: string;

    $: onSettings(settings);

    $: device = $devices[renderDeviceId ?? ''];
    $: insight = device?.insights.find(i => i.id === renderInsightId);
    $: resolution = renderSettings?.resolution ?? 'today';

    $: onLoad(insight, resolution);
    
    let loading: Promise<void>;
    let data: any = {};
    $: options = {
        plugins: {
            legend: {
                display: false
            }
        },
        elements: {
            point:{
                radius: 0
            }
        },
        scales: { 
            x: { 
                type: 'timeseries' 
            } 
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    function onSettings(s: InsightSettings) {
        if(renderSettings !== s) {
            renderSettings = s;

            if(renderDeviceId !== s.deviceId) {
                renderDeviceId = s.deviceId;
            }

            if(renderInsightId !== s.insightId) {
                renderInsightId = s.insightId;
            }
        }
    }

    function onLoad(i: InsightObj | undefined, r: string) {
        if(i !== undefined && (renderInsight !== i || renderResolution !== r)) {
            renderInsight = i;
            renderResolution = r;

            loading = getEntries(i, r);
        }
    }

    async function getEntries(i: InsightObj, r: string) {
        const entries = await $homey.insights.getLogEntries({ id: i.id, uri: i.uri, resolution: r });

        data = {
            datasets: [
                {
                    label: insight?.title,
                    data: entries.values.map(entry => ({ x: new Date(entry.t).getTime(), y: entry.v }))
                }
            ]
        };
    };
</script>

        {#if device == undefined || insight == undefined}
            <span>Error</span>
        {:else}
            <div class="header">
                <div>{device?.name}</div>
                <div class="subtitle">{insight?.title}</div>
            </div>
        {/if}
        {#if device == undefined || insight == undefined}
            {#if device == undefined}
                <span>Device not found.</span>
            {:else}
                <span>Insight not found.</span>
            {/if}
        {:else}
            <div class="chart">
                {#await loading}
                    <div class="loading">
                        <CircularProgress style="height: 50%; width: 50%;" indeterminate /> 
                    </div>
                {:then result}
                    <Line {data} options={options} />
                {:catch error} 
                    {error}
                {/await}
            </div>
        {/if}

<style>

.header {
    margin-left: 5px;
    font-size: small;
    height: 48px;
}

.subtitle {
    font-weight: lighter;
}

.chart {
    margin: 5px;
    width: calc(100% - 10px);
    height: calc(100% - 10px - 48px);
}

.loading {
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>