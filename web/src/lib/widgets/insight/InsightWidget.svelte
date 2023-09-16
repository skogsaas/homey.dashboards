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
                time: {
                    displayFormats: {
                        datetime: 'd MMM yyyy, HH:mm:ss',
                        millisecond: 'HH:mm:ss.SSS',
                        second: 'HH:mm:ss',
                        minute: 'HH:mm',
                        hour: 'HH:mm',
                        day: 'd MMM',
                        week: 'w, R',
                        month: 'MMM yyyy',
                        quarter: 'qqq - yyyy',
                        year: 'yyyy'
                    }
                },
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
        const timeSeries = resample(entries, aggregation, sampleRate, log.decimals);

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

    function resample(entries: LogEntries, aggregation: string, sampleRate: number, decimals: number | null) {
        // Can never aggregate with less step than sample rate.
        if(aggregation === undefined || aggregation === 'none' || (entries.step / 1000) >= sampleRate) {
            return entries.values
                .filter(entry => entry.v !== null && entry.v !== undefined)
                .map(entry => ({ x: new Date(entry.t).getTime(), y: round(entry.v, decimals) }));
        } else {
            const buckets = entries.values
                .filter(entry => entry.v !== null && entry.v !== undefined)
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
                            return { x: Number(timestamp), y: round(Math.min(...values), decimals) };
                        case 'max':
                            return { x: Number(timestamp), y: round(Math.max(...values), decimals) };
                        case 'sum':
                            return { x: Number(timestamp), y: round(values.reduce((a: number, b: number) => a + b, 0), decimals) };
                        case 'avg':
                            return { x: Number(timestamp), y: round(values.reduce((a: number, b: number) => a + b, 0) / values.length, decimals) };
                        case 'first':
                            return { x: Number(timestamp), y: round(values[0], decimals) };
                        case 'last':
                            return { x: Number(timestamp), y: round(values[values.length - 1], decimals) };
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

    function round(value: number, decimals: number | null) {
        if(!decimals) {
            return value;
        }

        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
</script>

        {#if series === undefined || series.length === 0}
            <span>No series selected</span>
        {:else}
            <div class="w-full h-full">
                <Chart bind:chart type="line" {data} {options} />
            </div>
        {/if}