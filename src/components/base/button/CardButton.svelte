<script lang="ts">
    import type {IconDefinition} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import TitledCard from "@perfice/components/base/card/TitledCard.svelte";
    import type {Snippet} from "svelte";

    let {icon, title, description, onClick, cardSuffix, class: className = ''}: {
        icon?: IconDefinition,
        title: string,
        description: string,
        onClick: () => void,
        class?: string,
        cardSuffix?: Snippet
    } = $props();
</script>


<button onclick={onClick} class="{className}">
    <TitledCard icon={icon} title={title} description={description} class="hover-feedback">
        {#snippet suffix()}
            {@render cardSuffix?.()}
        {/snippet}
    </TitledCard>
</button>