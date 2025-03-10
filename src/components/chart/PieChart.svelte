<script lang="ts">
    import {Chart} from 'chart.js';
    import 'chart.js/auto';
    import {onMount} from "svelte";
    import {categoryToCssRgb} from "@perfice/util/color";

    const {
        dataPoints,
        hideLabels = false,
        hideGrid = false,
        fillColor = "#9BD0F5",
        borderColor = "#36A2EB",
        ...rest
    } = $props();

    const randomHexColorCode = () => {
        let n = (Math.random() * 0xfffff * 1000000).toString(16);
        return '#' + n.slice(0, 6);
    };

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
    let canvasElem: HTMLCanvasElement;
    let chart: Chart;

    onMount(() => {
        chart = new Chart(canvasElem, {
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
        });

        return () => {
            chart.destroy();
        };
    });
</script>

<canvas class="rounded-b-xl" bind:this={canvasElem} {...rest}></canvas>
