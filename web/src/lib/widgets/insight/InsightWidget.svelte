<script lang="ts">
    import { devices, homey, insights } from '$lib/stores/homey';

    import { Chart } from 'svelte-chartjs';
    import 'chart.js/auto';
    import 'chartjs-adapter-date-fns';

    import type InsightSettings from './InsightSettings';
    import type { Series_v3 } from './InsightSettings';

    import type { Log, LogEntries, LogMap } from '$lib/types/Homey';
    
    import { onDestroy, } from 'svelte';
    import { dateFnsLocale } from '$lib/stores/i18n';
    
    const colors = ['#36a2eb', '#ff6384', '#4bc0c0', '#ff9f40', '#9966ff'];

    export let settings: InsightSettings;

    let resolution: string;
    let series: Series_v3[];

    $: onSettings(settings);
    $: onInsights($insights);
    
    let loading: Promise<void>;
    let timeout: number | undefined;

    let chart: Chart

    let data: any = {
            datasets: [
            ]
        };

    let options: any = {
        plugins: {
            legend: {
                display: true,
                labels: {
                    boxWidth: 10,
                    boxHeight: 2
                }
            }
        },
        elements: {
            point:{
                radius: 0
            }
        },
        scales: { 
            x: { 
                type: 'timeseries',
                adapters: {
                    date: {
                        locale: $dateFnsLocale
                    }
                }
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

        if(resolution === undefined || resolution !== s.resolution) {
            resolution = s.resolution ?? 'today';
            load = true;
        }

        if(series === undefined || series.length != s.series.length || JSON.stringify(series) !== JSON.stringify(s.series)) {
            if(s?.series !== undefined) {
                series = [...s.series];
                load = true;
            }
        }

        if(load) {
            reload();
        }
    }

    function onInsights(logs: LogMap) {
        reload();
    }

    function reload() {
        if(timeout !== undefined) {
            // Cleanup previous timeout.
            clearTimeout(timeout);
        }

        loading = getEntries();
    }

    async function getEntries() {  
        if(series === undefined || series.length === 0) {
            return;
        }
        
        // Create axes
        const units = series
            .map(s => $insights[s.insightId!])
            .filter(l => l !== undefined)
            .map(l => l.units)
            .filter((value, index, array) => array.indexOf(value) === index);

        for(var unit of units) {
            const axis = 'y' + unit;

            if(!Object.hasOwn(options.scales, axis)) {
                options.scales[axis] = { 
                    title: {
                        text: unit,
                        display: true
                    },
                    type: 'linear', 
                    display: 'auto'
                };
            }
        }

        // Create time series
        let timeoutMs = 999999999;

        for(var i = 0; i < series.length; i++) {
            const t = await getTimeSeries(series[i], i);

            if(t > 0 && t < timeoutMs) {
                timeoutMs = t;
            }
        }

        if(data.datasets.length > series.length) {
            data.datasets.splice(series.length);
        }

        // Set timeout for refreshing log
        timeout = setTimeout(() => { loading = getEntries(); }, timeoutMs);

        if(chart) {
            chart.update();
        }
    };

    async function getTimeSeries(series: Series_v3, index: number) : Promise<number> {
        if(series.insightId === undefined) {
            return -1;
        }

        const log = $insights[series.insightId];

        if(log === undefined) {
            return -1;
        }

        const aggregation = series.aggregation ?? 'none';
        const sampleRate = series.sampleRate ?? 60;

        const entries = await $homey.insights.getLogEntries({ id: log.id, uri: log.uri, resolution });
        const timeSeries = resample(entries, aggregation, sampleRate);

        data.datasets[index] = {
            label: getOwnerName(log.ownerUri) + ' - ' + log.title,
            type: 'line',
            borderColor: colors[index],
            data: timeSeries,
            tension: 0.5,
            yAxisID: 'y' + log.units
        }

        return entries.step - entries.updatesIn;
    }

    function resample(entries: LogEntries, aggregation: string, sampleRate: number) {
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

    function getOwnerName(uri: string) {
        if(uri.startsWith('homey:device:')) {
            const prefix = 'homey:device:';
            const id = uri.slice(prefix.length);

            return $devices[id].name;
        } else if(uri.startsWith('homey:manager:apps')) {
            return 'Homey Apps';
        } else if(uri.startsWith('homey:manager:system')) {
            return 'Homey System';
        } else if(uri.startsWith('homey:manager:weather')) {
            return 'Homey Weather';
        } else if(uri.startsWith('homey:manager:logic')) {
            return 'Homey Logic';
        } else {
            return uri;
        }
    }
</script>

        {#if series === undefined || series.length === 0}
            <span>No series selected</span>
        {:else}
            <div class="w-full h-full">
                <Chart bind:chart type="line" {data} {options} />
            </div>
        {/if}