<script lang="ts">
    import {
        formatDateHHMM,
        formatDateYYYYMMDDHHMMSS,
    } from "@perfice/util/time/format";

    let { value, onChange }: { value: Date; onChange: (d: Date) => void } =
        $props();

    let picker: HTMLInputElement | undefined;

    function openVanillaPicker() {
        picker?.showPicker();
    }

    function onInputChange(e: { target: EventTarget | null }) {
        if (!e.target) return;

        let input = e.target as HTMLInputElement;
        onChange(new Date(input.value));
    }
</script>

<div class="md:hidden flex">
    <button
        onclick={openVanillaPicker}
        class="border rounded-md px-2 py-1 items-center justify-center"
    >
        {formatDateHHMM(value)}
    </button>
    <input
        bind:this={picker}
        type="datetime-local"
        class={"invisible w-0 h-0"}
        onchange={onInputChange}
        value={formatDateYYYYMMDDHHMMSS(value)}
    />
</div>
