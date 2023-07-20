<script lang="ts">
    import { onMount } from 'svelte';

    import { Line } from 'svelte-chartjs';
    import 'chart.js/auto';
    import 'chartjs-adapter-date-fns';
    import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, TimeSeriesScale, TimeScale, LineController } from 'chart.js';

    import WidgetHeaderBody from "../WidgetHeaderBody.svelte";

    import type InsightSettings from './InsightSettings';
    import type { DeviceMap, DeviceObj, Homey, InsightObj, LogEntries } from '../../types/Homey';

    export let settings: InsightSettings;
    export let devices: DeviceMap;
    //export let editing: boolean;
    export let homey: Homey;

    $: device = devices[settings.deviceId ?? ''];
    $: insight = device?.insights.find(i => i.id === settings.insightId);
    $: getEntries(insight);
    
    //ChartJS.register(LineElement, LineController, PointElement, Title, Tooltip, Legend, CategoryScale, LinearScale, TimeSeriesScale, TimeScale );

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

    async function getEntries(insightObj: InsightObj | undefined) {
        if(insightObj && !entries) {
            entries = await homey.insights.getLogEntries({ id: insightObj.id, uri: insightObj.uri, resolution: 'last7Days' });
            console.log(entries);

            data = {
                datasets: [
                    {
                        label: insight?.title,
                        data: entries.values.map(entry => ({ x: new Date(entry.t).getTime(), y: entry.v })),
                    }
                ]
            };

            console.log(data);
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