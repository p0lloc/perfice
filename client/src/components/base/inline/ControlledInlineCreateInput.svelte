<script lang="ts">
    import InlineCreateInput from "@perfice/components/base/inline/InlineCreateInput.svelte";

    let {class: className = ''} = $props();

    let resolver: ((value: string) => void) | null = $state(null);

    export function prompt(callback: ((value: string) => void)) {
        resolver = callback;
    }

    export function hide() {
        resolver = null;
    }
</script>

{#if resolver != null}
    <InlineCreateInput class={className} onSubmit={resolver} onBlur={hide}/>
{/if}