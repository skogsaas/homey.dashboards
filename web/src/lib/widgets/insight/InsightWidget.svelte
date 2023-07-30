<script lang="ts">
    import { devices, homey } from '$lib/stores/homey';

    import { Line } from 'svelte-chartjs';
    import 'chart.js/auto';
    import 'chartjs-adapter-date-fns';

    import type InsightSettings from './InsightSettings';
    import type { InsightObj, LogEntries } from '$lib/types/Homey';

    export let settings: InsightSettings;

    $: device = $devices[settings.deviceId ?? ''];
    $: insight = device?.insights.find(i => i.id === settings.insightId);
    $: getEntries(insight, settings.resolution);
    
    let insightId: string;
    let resolution: string | undefined;

    let entries: LogEntries;
    let data: any = {};
    let options = {
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
        maintainAspectRatio: false
    };

    async function getEntries(i: InsightObj | undefined, r: string | undefined) {
        if(i && (!entries || insightId !== i.id || resolution !== r)) {
            insightId = i.id;
            resolution = r;
            
            entries = await $homey.insights.getLogEntries({ id: i.id, uri: i.uri, resolution: r });

            data = {
                datasets: [
                    {
                        label: insight?.title,
                        data: entries.values.map(entry => ({ x: new Date(entry.t).getTime(), y: entry.v })),
                    }
                ]
            };
        }
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
                <Line {data} options={options} />
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

</style>