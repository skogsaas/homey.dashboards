<script lang="ts">
    import { devices, homey, insights } from '$lib/stores/homey';

    import { Chart } from 'svelte-chartjs';
    import 'chart.js/auto';
    import 'chartjs-adapter-date-fns';

    import type { InsightSettings_v5 } from './InsightSettings';
    import type { Series_v5 } from './InsightSettings';
    import { colors } from './colors';

    import type { Log, LogEntries, LogMap } from '$lib/types/Homey';
    
    import { onDestroy, } from 'svelte';
    import { dateFnsLocale } from '$lib/stores/i18n';
    import type { Threshold, WidgetContext } from '$lib/types/Widgets';
    import type { GridStackWidget } from 'gridstack';
    
    export let context: WidgetContext;
    export let settings: InsightSettings_v5;

    let resolution: string;
    let series: Series_v5[];

    $: onSettings(settings);
    $: onInsights($insights);
    
    let loading: Promise<void>;
    let timeout: number | undefined;

    let chart: Chart

    let data: any = {
            datasets: [
            ]
        };

    let plugins: any[] = [{
        beforeRender: (context: any, options: any) => thresholdColors(context, options)
    }]

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
                type: 'time',
                time: {
                    displayFormats: {
                        datetime: 'd MMM yyyy, HH:mm:ss',
                        millisecond: 'HH:mm:ss.SSS',
                        second: 'HH:mm:ss',
                        minute: 'HH:mm',
                        hour: 'HH',
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

    async function onSettings(s: InsightSettings_v5) {
        let load: boolean = false;

        if(resolution === undefined || resolution !== s.resolution) {
            resolution = s.resolution ?? 'today';
            load = true;
        }

        if(series === undefined || 
            series.length != s.series?.length || 
            JSON.stringify(series) !== JSON.stringify(s.series)
        ) {
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

        try {
            for(var i = 0; i < series.length; i++) {
                const t = await getTimeSeries(series[i], i);

                if(t > 0 && t < timeoutMs) {
                    timeoutMs = t;
                }
            }
        }
        catch(e) {
            // Ignore for now.
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

    async function getTimeSeries(series: Series_v5, index: number) : Promise<number> {
        if(series.insightId === undefined) {
            return -1;
        }

        const log = $insights[series.insightId];

        if(log === undefined) {
            return -1;
        }

        const aggregation = series.aggregation ?? 'none';
        const sampleRate = series.sampleRate ?? 60;

        try {
            const entries = await $homey.insights.getLogEntries({ id: log.id, uri: log.uri, resolution });
            const timeSeries = resample(entries, aggregation, sampleRate, log.decimals);

            const yAxis = 'y' + log.units;

            data.datasets[index] = {
                label: series.title ?? (getOwnerName(log.ownerUri) + ' - ' + log.title),
                type: series.type ?? 'line',
                borderThresholds: series.border,
                backgroundThresholds: series.background,
                fill: series.fill,
                data: timeSeries,
                tension: 0.5,
                yAxisID: yAxis,
                stepped: log.type === 'boolean' ? true : undefined
            };

            return Math.max(entries.step - entries.updatesIn, 10_000);
        }
        catch(e) {
            // Do nothing for now.
        }

        return 30_000; // By default refresh every 30 seconds
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

    function thresholdColors(context: any, options: any) {
        context.data.datasets.forEach((dataset: any, index: number) => {
            const borderThresholds: Threshold[] | undefined = dataset.borderThresholds;
            const backgroundThresholds: Threshold[] | undefined = dataset.backgroundThresholds;

            const scale = context.scales[dataset.yAxisID];

            dataset.borderColor = createGradient(context, borderThresholds, scale, index);
            dataset.backgroundColor = createGradient(context, backgroundThresholds, scale, index);
        });
    }

    function createGradient(_chart: any, thresholds: Threshold[] | undefined, scale: any, index: number) {
        if(_chart === undefined) return;

        const {ctx, chartArea} = _chart;

        let gradient = ctx.createLinearGradient(0, _chart.height, 0, 0);

        let previous: Threshold | undefined = undefined;

        if(thresholds !== undefined) {
            for (let i = thresholds.length - 1; i >= 0; i--) {
                const threshold = thresholds[i];
                
                if(previous === undefined) {                    
                    gradient.addColorStop(0, threshold.color); // Base color start
                } else {
                    const yPos = scale.getPixelForValue(threshold.value);
                    const factor = 1 -(yPos / _chart.height);

                    if(factor < 0 || factor > 1) {
                        break;
                    }

                    gradient.addColorStop(factor, previous.color); // Previous color end
                    gradient.addColorStop(factor, threshold.color); // Current color start
                }

                previous = threshold;
            }
        }

        if(previous !== undefined) {
            gradient.addColorStop(1, previous.color); // Previous color end
        } else {
            return colors[index % colors.length];
        }
        
        return gradient;
    }

    function getOwnerName(uri: string) {
        if(uri.startsWith('homey:device:')) {
            const prefix = 'homey:device:';
            const id = uri.slice(prefix.length);

            return $devices[id]?.name ?? uri;
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
    <span>Insights not configured</span>
{:else}
    <Chart 
        bind:chart 
        type="line" 
        {data} 
        {options} 
        {plugins}
    />
{/if}