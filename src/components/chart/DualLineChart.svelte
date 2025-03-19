<script lang="ts">
    import CanvasChartRenderer from "@perfice/components/chart/CanvasChartRenderer.svelte";
    import type {ChartConfiguration, DefaultDataPoint} from "chart.js";

    const {
        first,
        second,
        firstLabel,
        secondLabel,
        labels,

        hideLabels = true,
        hideGrid = false,

        firstFillColor = "#9BD0F5",
        firstBorderColor = "#36A2EB",
        secondFillColor = "#9BD0F5",
        secondBorderColor = "#36A2EB",
    }: {
        first: number[],
        second: number[],
        labels: string[],
        firstLabel: string,
        secondLabel: string,

        hideLabels?: boolean,
        hideGrid?: boolean,
        minimal?: boolean,

        firstFillColor?: string,
        firstBorderColor?: string,
        secondFillColor?: string,
        secondBorderColor?: string,
    } = $props();

    const data = $derived({
        labels: labels,
        datasets: [
            {
                label: firstLabel,
                data: first,
                fill: true,
                borderColor: firstBorderColor,
                backgroundColor: firstFillColor,
                tension: 0.5,
                borderWidth: 2,
            },
            {
                label: secondLabel,
                data: second,
                fill: true,
                borderColor: secondBorderColor,
                backgroundColor: secondFillColor,
                tension: 0.5,
                borderWidth: 2,
            }
        ]
    });

    const config: ChartConfiguration<'line', DefaultDataPoint<'line'>> = {
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
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    };
</script>

<CanvasChartRenderer {data} {config}/>