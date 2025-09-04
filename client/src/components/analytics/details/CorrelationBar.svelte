<script lang="ts">
    let {coefficient, full = false}: { coefficient: number, full?: boolean } = $props();

    let positive = $derived(coefficient > 0);
    let negative = $derived(coefficient < 0);
</script>

<div class="flex flex-1">
    {#if !full && positive}
        <div class="flex-1"></div>
    {/if}
    <div class="flex-1 flex">
        <div class="w-full">
            <div class="flex {!full && negative ? 'justify-end' : ''}">
                <div
                        class="{positive
						? 'bg-green-500'
						: 'bg-red-500'} p-2 rounded-md"
                        style:width="{Math.abs(coefficient) * 100}%"
                ></div>
            </div>
        </div>
    </div>

    {#if !full && negative}
        <div class="flex-1"></div>
    {/if}
</div>
