<script lang="ts">
    import {Chart, type ChartData, type ChartType, type DefaultDataPoint} from 'chart.js';
    import 'chart.js/auto';
    import {onMount} from "svelte";
    import type {ChartConfiguration} from "chart.js";

    const {
        config,
        data,
    }: {
        config: ChartConfiguration<ChartType, DefaultDataPoint<ChartType>>,
        data: ChartData<ChartType, DefaultDataPoint<ChartType>>
    } = $props();

    let canvasElem: HTMLCanvasElement;
    let chart: Chart;

    onMount(() => {
        chart = new Chart(canvasElem, config);

        return () => {
            chart.destroy();
        };
    });

    $effect(() => {
        if (chart) {
            chart.data = data;
            chart.update();
        }
    });
</script>

<canvas class="rounded-b-xl" bind:this={canvasElem}></canvas>
