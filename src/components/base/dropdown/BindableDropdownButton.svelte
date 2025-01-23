<script lang="ts" generics="T">
    import DropdownButton from "./DropdownButton.svelte";
    import type {DropdownMenuItemDetails} from "@perfice/model/ui/dropdown";

    let {value = $bindable(), items, onChange, ...rest}: {
        value: T,
        items: DropdownMenuItemDetails<T>[],
        rest?: any[],
        onChange?: (t: T) => void
    } = $props();

    function change(i: T) {
        value = i;
        onChange?.(i);
    }
</script>

<DropdownButton {...rest} {value} items={items.map(i => {
    return {
        ...i,
        action: () => change(i.value),
    }
})}/>
