<script lang="ts">
    import type {Snippet} from "svelte";

    let {progress, strokeWidth = 30, width = 100, height = 100, strokeColor = "red", children}: {
        progress: number,
        strokeColor: string, strokeWidth?: number;
        children?: Snippet,
        width?: number, height?: number
    } = $props();
</script>

<div class="flex justify-center items-center flex-wrap relative w-full h-full" style:width="{width}px"
     style:height="{height}px">
    <div class="absolute text-center text-sm" style:width="{width - strokeWidth - 5}px">{@render children?.()}</div>
    <svg
            width={width} height={height} viewBox="0 0 250 250"
            style:--stroke-width="{strokeWidth}px"
            style:--progress="{progress * 100}"
            style:--stroke-color="{strokeColor}"
            class="circular-progress"
    >
        <circle class="bg"></circle>
        <circle class="fg"></circle>
    </svg>
</div>

<style>

    .circular-progress {
        --size: 250px;
        --half-size: calc(var(--size) / 2);
        --stroke-width: var(--stroke-width);
        --radius: calc((var(--size) - var(--stroke-width)) / 2);
        --circumference: calc(var(--radius) * pi * 2);
        --dash: calc((var(--progress) * var(--circumference)) / 100);
    }

    .circular-progress circle {
        cx: var(--half-size);
        cy: var(--half-size);
        r: var(--radius);
        stroke-width: var(--stroke-width);
        fill: none;
    }

    .circular-progress circle.bg {
        stroke: #ddd;
    }

    .circular-progress circle.fg {
        transform: rotate(-90deg);
        transform-origin: var(--half-size) var(--half-size);
        stroke-dasharray: var(--dash) calc(var(--circumference) - var(--dash));
        transition: stroke-dasharray 0.3s linear 0s;
        stroke: var(--stroke-color);
    }
</style>
