<script lang="ts">
    import {Chart} from 'chart.js';
    import 'chart.js/auto';

    const {
        dataPoints,
        labels,
        hideLabels = false,
        hideGrid = false,
        fillColor = "#9BD0F5",
        borderColor = "#36A2EB",
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
                pointRadius: 0,
                pointHoverRadius: 10
            }
        ]
    });
    let canvasElem: HTMLCanvasElement;
    let chart: Chart;

    $effect(() => {
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
                scales: {

                    y: {
                        beginAtZero: true,
                        ticks: {
                            padding: 0,
                            display: !hideLabels
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
