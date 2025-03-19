<script lang="ts">
    import {type ChartConfiguration, type DefaultDataPoint} from 'chart.js';
    import 'chart.js/auto';
    import {categoryToCssRgb} from "@perfice/util/color";
    import CanvasChartRenderer from "@perfice/components/chart/CanvasChartRenderer.svelte";

    const {
        dataPoints,
        hideLabels = false,
        hideGrid = false,
    } = $props();

    const data = $derived({
        labels: Object.keys(dataPoints),
        datasets: [
            {
                data: Object.values(dataPoints) as number[],
                fill: true,
                backgroundColor: Object.keys(dataPoints).map((v: string) => categoryToCssRgb(v)),
                tension: 0.5,
                borderWidth: 2,
            }
        ]
    });

    let config: ChartConfiguration<'pie', DefaultDataPoint<'pie'>> = {
        type: 'pie',
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
            },
            plugins: {
                legend: {
                    position: 'right',
                },
            }
        },
    };
</script>

<CanvasChartRenderer {data} {config}/>
