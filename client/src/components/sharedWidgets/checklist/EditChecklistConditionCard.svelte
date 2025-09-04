<script lang="ts">
    import GenericEditDeleteCard from "@perfice/components/base/card/GenericEditDeleteCard.svelte";
    import type {ChecklistCondition} from "@perfice/model/sharedWidgets/checklist/checklist";

    let {condition, onDelete, onEdit}: {
        condition: ChecklistCondition,
        onDelete: () => void,
        onEdit: () => void
    } = $props();
</script>

<GenericEditDeleteCard {onEdit} {onDelete}
                       text={condition.name}/>

