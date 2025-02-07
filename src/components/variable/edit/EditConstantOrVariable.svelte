<script lang="ts">
    import {type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
    import type {ConstantOrVariable} from "@perfice/services/variable/types/goal";
    import EditConstant from "@perfice/components/variable/edit/EditConstant.svelte";
    import EditVariable from "@perfice/components/variable/edit/EditVariable.svelte";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faCheck} from "@fortawesome/free-solid-svg-icons";

    let {value, onBack, onChange}: {
        value: ConstantOrVariable,
        onBack: () => void,
        onChange: (v: ConstantOrVariable) => void } = $props();

    function onConstantChange(v: PrimitiveValue) {
        value.value = v;
        onChange($state.snapshot(value));
    }

</script>

{#if value.constant || value.value.type !== PrimitiveValueType.STRING}
    <EditConstant value={value.value} onChange={onConstantChange} />
{:else}
    <EditVariable variableId={value.value.value} />
{/if}
<Button class="flex justify-center items-center" color={ButtonColor.WHITE} onClick={onBack}>
    <Fa icon={faCheck} />
</Button>
