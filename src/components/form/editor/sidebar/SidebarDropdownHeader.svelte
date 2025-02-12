<script lang="ts" generics="T">
    import {type IconDefinition} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import type {DropdownMenuItem} from "@perfice/model/ui/dropdown";


    let {icon, title, value, items}: {
        icon: IconDefinition,
        title: string,
        value: T,
        items: DropdownMenuItem<T>[]
    } = $props();
</script>

<div class="mt-4 row-between bg-green-600 px-4 py-2">
    <div class="row-gap font-bold text-white">
        <Fa icon={icon} class="w-4"/>
        <p>{title}</p>
    </div>
    <DropdownButton class="min-w-40 bg-white text-black" value={value} items={items}/>
</div>
