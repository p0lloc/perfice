<script lang="ts">
    import {Chart} from 'chart.js';
    import 'chart.js/auto';
    import {onMount} from "svelte";

    const {
        dataPoints,
        labels,
        hideLabels = false,
        hideGrid = false,
        minimal = true,
        fillColor = "#9BD0F5",
        borderColor = "#36A2EB",
        labelFormatter = (v: number) => v.toString(),
        ...rest
    } = $props();

    const data = $derived({
        labels: labels,
        datasets: [
            {
                data: dataPoints,
                fill: true,
                borderColor: borderColor,
                backgroundColor: fillColor,
                tension: 0.5,
                borderWidth: 2,
                pointRadius: minimal ? 0 : undefined,
                pointHoverRadius: minimal ? 10 : undefined
            }
        ]
    });
    let canvasElem: HTMLCanvasElement;
    let chart: Chart;

    onMount(() => {
        chart = new Chart(canvasElem, {
            type: 'line',
            data,
            options: {
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: -10,
                        bottom: -10,
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return labelFormatter(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            padding: 0,
                            display: !hideLabels,
                            callback: (tickValue) => labelFormatter(tickValue),
                        },
                        grid: {
                            display: !hideGrid,
                        },
                        border: {
                            display: false
                        }
                    },
                    xAxis: {
                        display: !hideLabels
                    },
                    yAxis: {
                        display: !hideLabels,
                    },
                    x: {
                        ticks: {
                            padding: 0,
                            display: !hideLabels
                        },
                        grid: {
                            display: !hideGrid
                        },
                        border: {
                            display: false
                        }
                    }
                }
            }
        });

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

    Chart.defaults.set('plugins.legend', {display: false});
</script>

<canvas class="rounded-b-xl" bind:this={canvasElem} {...rest}></canvas>
