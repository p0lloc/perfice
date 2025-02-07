<script lang="ts">
    import {type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faCheck, faTimes} from "@fortawesome/free-solid-svg-icons";

    let {value}: { value: PrimitiveValue } = $props();
</script>

{#if value.type === PrimitiveValueType.BOOLEAN && value.value}
    <Fa icon={faCheck} class="text-green-500"/>
{:else}
    <Fa icon={faTimes} class="text-red-500"/>
{/if}
