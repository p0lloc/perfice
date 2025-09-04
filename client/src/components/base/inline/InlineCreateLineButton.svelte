<script lang="ts">
    import InlineCreateInput from "@perfice/components/base/inline/InlineCreateInput.svelte";
    import LineButton from "@perfice/components/base/button/LineButton.svelte";

    let {onSubmit}: {
        onSubmit: (name: string) => void
    } = $props();

    let addingCategory = $state(false);

    function addCategory() {
        addingCategory = true;
    }
</script>
{#if addingCategory}
    <div class="mt-4">
        <InlineCreateInput class="w-full" onBlur={() => addingCategory = false}
                           onSubmit={(name) => onSubmit(name)}/>
    </div>
{:else}
    <LineButton onClick={addCategory}/>
{/if}
