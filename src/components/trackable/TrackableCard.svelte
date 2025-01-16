<script lang="ts">
    import type {Trackable} from "@perfice/model/trackable/trackable";

    let {trackable}: {trackable: Trackable} = $props();
</script>

<div class="bg-white p-2 border">
    {trackable.name}
</div>
