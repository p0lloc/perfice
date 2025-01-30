<script lang="ts">
    import GenericEditDeleteCard from "@perfice/components/base/card/GenericEditDeleteCard.svelte";
    import type {SegmentedOption} from "@perfice/model/form/display/segmented";

    let {option, onDelete, onEdit}: { option: SegmentedOption, onDelete: () => void, onEdit: () => void } = $props();
</script>

<GenericEditDeleteCard {onEdit} {onDelete} text={option.text}/>
