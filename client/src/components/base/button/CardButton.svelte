<script lang="ts">
    import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import TitledCard from "@perfice/components/base/card/TitledCard.svelte";
    import type { Snippet } from "svelte";

    let {
        icon,
        title,
        description,
        onClick,
        cardSuffix,
        disabled = false,

        cardClass = "hover-feedback card",
        buttonClass = "",
        iconClass = "w-8",
    }: {
        icon?: IconDefinition;
        title: string;
        iconClass?: string;
        description: string;
        onClick: () => void;
        disabled?: boolean;
        buttonClass?: string;
        cardClass?: string;
        cardSuffix?: Snippet;
    } = $props();

    function handleClick() {
        if (disabled) return;
        onClick();
    }
</script>

<button onclick={handleClick} class={buttonClass}>
    <TitledCard {iconClass} {icon} {title} {description} class={cardClass}>
        {#snippet suffix()}
            {@render cardSuffix?.()}
        {/snippet}
    </TitledCard>
</button>
