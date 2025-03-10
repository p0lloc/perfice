<script lang="ts">
	import { Chart } from "chart.js";
	import "chart.js/auto";
	import { onMount } from "svelte";

	const {
		dataPoints,
		hideLabels = false,
		hideGrid = false,
		fillColor = "#9BD0F5",
		borderColor = "#36A2EB",
		...rest
	} = $props();

	const data = $derived({
		labels: Object.keys(dataPoints),
		datasets: [
			{
				data: Object.values(dataPoints) as number[],
				fill: true,
				backgroundColor: "rgba(75, 192, 192, 1.0)",
			},
		],
	});
	let canvasElem: HTMLCanvasElement;
	let chart: Chart;

	onMount(() => {
		chart = new Chart(canvasElem, {
			type: "bar",
			data,
			options: {
				animation: false,
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							padding: 0,
						},
						border: {
							display: false,
						},
					},
					x: {
						ticks: {
							padding: 0,
						},
						border: {
							display: false,
						},
					},
				},
			},
		});

		return () => {
			chart.destroy();
		};
	});
</script>

<canvas class="rounded-b-xl" bind:this={canvasElem} {...rest}></canvas>
