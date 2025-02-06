<script lang="ts">
    import {pNumber, primitiveAsNumber, type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {value, onBack, onChange}: { value: PrimitiveValue, onBack: () => void, onChange: (v: PrimitiveValue) => void } = $props();
    let numberValue = $state<number>(primitiveAsNumber(value));

    function onChangeValue(e: { currentTarget: HTMLInputElement }) {
        onChange(pNumber(parseFloat(e.currentTarget.value)));
    }
</script>

<div>
    <button class="icon-button" onclick={onBack}>
        <Fa icon={faArrowLeft}/>
    </button>
</div>
<input type="number" bind:value={numberValue} onchange={onChangeValue} />
