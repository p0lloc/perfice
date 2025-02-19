<script lang="ts">
    import {formatDateYYYYMMDD} from "@perfice/util/time/format";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {dateToMidnight} from "@perfice/util/time/simple.js";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {faTimes} from "@fortawesome/free-solid-svg-icons";

    let {value, name, onChange}: {
        name: string,
        value: number | null,
        onChange: (v: number | null) => void
    } = $props();

    function add() {
        onChange(dateToMidnight(new Date()).getTime());
    }

    function remove() {
        onChange(null);
    }

    function onDateChange(e: { currentTarget: HTMLInputElement }) {
        let value = e.currentTarget.valueAsNumber;
        if (value == null) return;

        onChange(value);
    }
</script>

{#if value != null}
    <div class="row-gap bg-gray-100 rounded-md pr-2 w-full md:w-auto">
        <input type="date" class="input flex-1" value={formatDateYYYYMMDD(new Date(value))}
                                    onchange={onDateChange}/>
        <IconButton icon={faTimes} onClick={remove}/>
    </div>
{:else}
    <Button class="w-full md:w-auto" onClick={add}>Add {name}</Button>
{/if}
