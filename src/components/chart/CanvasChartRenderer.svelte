<script lang="ts">
    import type {ChartConfiguration} from "chart.js";
    import {Chart, type ChartData, type ChartType, type DefaultDataPoint} from 'chart.js';
    import 'chart.js/auto';
    import {onMount} from "svelte";

    const {
        config,
        data,
        blur = false
    }: {
        config: ChartConfiguration<ChartType, DefaultDataPoint<ChartType>>,
        data: ChartData<ChartType, DefaultDataPoint<ChartType>>
        blur?: boolean
    } = $props();

    let canvasElem: HTMLCanvasElement;
    let chart: Chart;

    onMount(() => {
        chart = new Chart(canvasElem, config);

        return () => {
            chart.destroy();
        };
    });


    function updateChart(data: ChartData<ChartType, DefaultDataPoint<ChartType>>) {
        if (chart) {
            chart.data = data;
            chart.update();
        }
    }

    $effect(() => updateChart(data));
</script>

<canvas class="rounded-b-xl" style="filter: {blur ? 'blur(3px)' : ''}"
        bind:this={canvasElem}></canvas>
