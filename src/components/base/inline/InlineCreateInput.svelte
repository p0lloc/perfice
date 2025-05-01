<script lang="ts">
    import {onMount} from "svelte";

    let {onSubmit, class: className = 'w-24', onBlur}: {
        onSubmit: (name: string) => void,
        onBlur: () => void,
        class?: string
    } = $props();

    let input: HTMLInputElement;

    function onKeyDown(e: KeyboardEvent & { currentTarget: HTMLInputElement }) {
        if (e.key !== "Enter") return;

        onSubmit(e.currentTarget.value);
        e.currentTarget.value = "";
    }

    onMount(() => {
        input.focus();
    });
</script>

<input type="text" bind:this={input} class="{className} rounded-xl text-sm"
       placeholder="Name" onblur={onBlur} onkeydown={onKeyDown}/>
