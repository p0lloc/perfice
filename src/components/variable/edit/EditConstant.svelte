<script lang="ts">
    import {pNumber, primitiveAsNumber, type PrimitiveValue} from "@perfice/model/primitive/primitive";
    // noinspection ES6UnusedImports

    let {value, onChange}: { value: PrimitiveValue, onChange: (v: PrimitiveValue) => void } = $props();
    let numberValue = $state<number>(primitiveAsNumber(value));

    function onChangeValue(e: { currentTarget: HTMLInputElement }) {
        onChange(pNumber(parseFloat(e.currentTarget.value)));
    }
</script>

<input type="number" bind:value={numberValue} onchange={onChangeValue} />
