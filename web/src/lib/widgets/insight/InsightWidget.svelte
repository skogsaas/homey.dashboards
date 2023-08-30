<script lang="ts">
    import { devices, homey, insights } from '$lib/stores/homey';

    import { Chart } from 'svelte-chartjs';
    import 'chart.js/auto';
    import 'chartjs-adapter-date-fns';

    import type InsightSettings from './InsightSettings';
    import type { Log, LogEntries } from '$lib/types/Homey';
    import CircularProgress from '@smui/circular-progress';
    import { onDestroy, } from 'svelte';

    export let settings: InsightSettings;

    let insightId: string | undefined;
    let resolution: string;
    let aggregation: string;
    let sampleRate: number;

    let log: Log | undefined;
    let entries: LogEntries;

    $: onSettings(settings);
    
    let loading: Promise<void>;
    let timeout: number | undefined;

    let chart: Chart

    let data: any = {
            datasets: [
            ]
        };

    let options: any;
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
        animation: false
    };

    onDestroy(() => {
        if(timeout !== undefined) {
            clearTimeout(timeout);
        }
    })

    async function onSettings(s: InsightSettings) {
        let load: boolean = false;

        if(insightId !== s.insightId) {
            insightId = s.insightId;
            load = true;
        }

        if(resolution === undefined || resolution !== s.resolution) {
            resolution = s.resolution ?? 'today';
            load = true;
        }

        if(aggregation === undefined || aggregation !== s.aggregation) {
            aggregation = s.aggregation ?? 'none';
            load = true;
        }

        if(sampleRate === undefined || sampleRate !== s.sampleRate) {
            sampleRate = s.sampleRate ?? 60;
            load = true;
        }

        if(load && insightId) {
            log = $insights[insightId];

            reload();
        }
    }

    function reload() {
        if(timeout !== undefined) {
            // Cleanup previous timeout.
            clearTimeout(timeout);
        }

        loading = getEntries();
    }

    async function getEntries() {
        if(log === undefined) {
            return;
        }
        
        entries = await $homey.insights.getLogEntries({ id: log.id, uri: log.uri, resolution });

        const series = createTimeSeries(entries);

        // Set timeout for refreshing log
        timeout = setTimeout(() => { loading = getEntries(); }, entries.step - entries.updatesIn);

        if(data.datasets.length === 0) {
            data.datasets.push({
                label: log.title,
                type: 'line',
                data: series,
                tension: 0.5
            });
        } else {
            // TODO: support multiple datasets
            data.datasets[0].data = series;
        }

        if(chart) {
            chart.update();
        }
    };

    function createTimeSeries(entries: LogEntries) {
        // Can never aggregate with less step than sample rate.
        if(aggregation === undefined || aggregation === 'none' || (entries.step / 1000) >= sampleRate) {
            return entries.values.map(entry => ({ x: new Date(entry.t).getTime(), y: entry.v }));
        } else {
            const buckets = entries.values
                .reduce((timeBuckets: any, entry) => {
                    const time = new Date(entry.t);
                    const value = entry.v;

                    const timeOfDay = time.getHours() * 3600 + time.getMinutes() * 60 + time.getSeconds();
                    const timestamp = time.getTime() - (timeOfDay % sampleRate) * 1000;

                    const bucket = timeBuckets[timestamp] = timeBuckets[timestamp] ?? [];
                    bucket.push(value);

                    return timeBuckets;
                }, {});

            const result = Object.keys(buckets)
                .map(timestamp => {
                    const values = buckets[timestamp];

                    switch(aggregation) {
                        case 'min':
                            return { x: Number(timestamp), y: Math.min(...values) };
                        case 'max':
                            return { x: Number(timestamp), y: Math.max(...values) };
                        case 'sum':
                            return { x: Number(timestamp), y: values.reduce((a: number, b: number) => a + b, 0) };
                        case 'avg':
                            return { x: Number(timestamp), y: values.reduce((a: number, b: number) => a + b, 0) / values.length };
                        case 'first':
                            return { x: Number(timestamp), y: values[0] };
                        case 'last':
                            return { x: Number(timestamp), y: values[values.length - 1] };
                    }
                });

            return result;
        }
    }

    function getOwnerUriName(uri: string) {
        if(uri.startsWith('homey:device:')) {
            const prefix = 'homey:device:';
            const id = uri.slice(prefix.length);

            return $devices[id].name;
        } else if(uri.startsWith('homey:manager:apps')) {
            return 'Homey Applications';
        } else if(uri.startsWith('homey:manager:system')) {
            return 'Homey System';
        } else if(uri.startsWith('homey:manager:weather')) {
            return 'Homey Weather';
        } else if(uri.startsWith('homey:manager:logic')) {
            return 'Homey Logic';
        } else if(uri.startsWith('homey:manager:user')) {
            return 'Homey Users';
        } else {
            return uri;
        }
    }
</script>

        {#if log === undefined}
            {#if insightId !== undefined}
                <span>Error</span>
            {/if}
        {:else}
            <div class="header">
                <div>{log.title}</div>
                <div class="subtitle">{getOwnerUriName(log.ownerUri)}</div>
            </div>
        {/if}
        {#if log === undefined}
            {#if insightId !== undefined}
                <span>Log not found.</span>
            {/if}
        {:else}
            <div class="chart">
                <Chart bind:chart type="line" {data} {options} />
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