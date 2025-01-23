<script lang="ts">
    import type {SelectFormQuestionSettings} from "@perfice/model/form/display/select";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {pString} from "@perfice/model/primitive/primitive";

    let {settings = $bindable()}: { settings: SelectFormQuestionSettings } = $props();

    function addOption() {
        settings.options.push({
            id: crypto.randomUUID(),
            text: "New option",
            value: pString("new option")
        });
    }
</script>

<h2>Options</h2>
<button onclick={addOption}>
    <Fa icon={faPlus} class="pointer-events-none"/>
</button>
{#each settings.options as option}
    <p>{option.text}</p>
{/each}
