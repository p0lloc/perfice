<script lang="ts">
    import type {IconDefinition} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import TitledCard from "@perfice/components/base/card/TitledCard.svelte";
    import type {Snippet} from "svelte";

    let {
        icon, title, description, onClick, cardSuffix,

        cardClass = 'hover-feedback bg-white',
        buttonClass = '', iconClass = 'w-8'
    }: {
        icon?: IconDefinition,
        title: string,
        iconClass?: string,
        description: string,
        onClick: () => void,
        buttonClass?: string,
        cardClass?: string,
        cardSuffix?: Snippet
    } = $props();
</script>


<button onclick={onClick} class="{buttonClass}">
    <TitledCard {iconClass} icon={icon} title={title} description={description} class="{cardClass}">
        {#snippet suffix()}
            {@render cardSuffix?.()}
        {/snippet}
    </TitledCard>
</button>