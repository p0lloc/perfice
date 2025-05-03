<script lang="ts">
    import CanvasChartRenderer from "@perfice/components/chart/CanvasChartRenderer.svelte";
    import type {ChartConfiguration, ChartType, DefaultDataPoint} from "chart.js";
    import {categoryToCssRgb} from "@perfice/util/color";

    const {
        type,
        dataPoints,
        labels,
        hideLabels = false,
        hideGrid = false,
        minimal = true,
        legend = true,
        randomColor = false,
        fillColor = "#9BD0F5",
        borderColor = "#36A2EB",
        dataSetLabel = "Data",
        title,
        labelFormatter = (v: number) => v.toString(),
    }: {
        type: ChartType,
        dataPoints: number[],
        labels: string[],
        randomColor?: boolean,
        hideLabels?: boolean,
        hideGrid?: boolean,
        minimal?: boolean,
        legend?: boolean,
        fillColor?: string,
        borderColor?: string,
        dataSetLabel?: string,
        title?: string | null,
        labelFormatter?: (v: number) => string,
    } = $props();

    const data = $derived({
        labels: labels,
        datasets: [
            {
                label: dataSetLabel,
                data: dataPoints,
                fill: true,
                borderColor: randomColor ? undefined : borderColor,
                backgroundColor: randomColor ? labels.map((v: string) => categoryToCssRgb(v)) : fillColor,
                tension: 0.5,
                borderWidth: 2,
                pointRadius: minimal ? 0 : undefined,
                pointHoverRadius: minimal ? 10 : undefined
            }
        ]
    });

    let config: ChartConfiguration<ChartType, DefaultDataPoint<ChartType>> = {
        type: type,
        data,
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: minimal ? {
                    top: 10,
                    left: -10,
                    bottom: -10,
                } : undefined
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return labelFormatter(context.parsed.y);
                        }
                    }
                },
                title: title != null ? {
                    display: true,
                    text: title
                } : undefined,
                legend: {
                    display: !minimal && legend
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        padding: minimal ? 0 : undefined,
                        display: !hideLabels,
                        callback: (tickValue) =>
                            labelFormatter(typeof tickValue == "number" ? tickValue : parseFloat(tickValue)),
                    },
                    grid: {
                        display: !hideGrid,
                    },
                    border: {
                        display: false
                    }
                },
                x: {
                    ticks: {
                        padding: 0,
                        autoSkip: true,
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
    };
</script>

<CanvasChartRenderer {data} {config}/>
