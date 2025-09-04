<script lang="ts">
    import {formatTimestampHHMM} from "@perfice/util/time/format.js";

    let {timestamp}: { timestamp: number } = $props();
</script>

<p class="font-bold text-gray-600" style="font-size: 12px;">
    {formatTimestampHHMM(timestamp)}
</p>
