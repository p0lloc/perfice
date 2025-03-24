<script lang="ts">
    import type {SelectOption} from "@perfice/model/form/display/select";
    import GenericEditDeleteCard from "@perfice/components/base/card/GenericEditDeleteCard.svelte";
    import {ICONS} from "@perfice/components/base/icon/icons";

    let {option, onDelete, onEdit}: { option: SelectOption, onDelete: () => void, onEdit: () => void } = $props();
</script>

<GenericEditDeleteCard {onEdit} {onDelete} icon={option.icon != null ? ICONS[option.icon] : undefined}
                       text={option.text}/>

