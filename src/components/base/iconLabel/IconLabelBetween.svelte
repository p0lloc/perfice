<script lang="ts">
    import {type IconDefinition} from "@fortawesome/free-solid-svg-icons";
    import type {Snippet} from "svelte";
    import IconLabel from "@perfice/components/base/iconLabel/IconLabel.svelte";

    let {icon, title, children}: { icon: IconDefinition, title: string, children: Snippet } = $props();
</script>

<div class="row-between mt-4 flex-wrap gap-2">
    <IconLabel {icon} {title} />

    {@render children()}
</div>
