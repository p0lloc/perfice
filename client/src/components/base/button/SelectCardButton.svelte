<script lang="ts">
    import type {IconDefinition} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import type {Snippet} from "svelte";
    import CardButton from "@perfice/components/base/button/CardButton.svelte";

    let {
        icon, title,
        selected,
        description,
        onSelect, cardSuffix,
        buttonClass = '', iconClass = 'w-8'
    }: {
        icon?: IconDefinition,
        title: string,
        selected: boolean,
        iconClass?: string,
        description: string,
        onSelect: () => void,
        buttonClass?: string,
        cardClass?: string,
        cardSuffix?: Snippet
    } = $props();

    let cardClass = $derived(selected ? "pointer-feedback:bg-green-100 bg-white border-1 border-green-500 bg-green-50" : "hover-feedback bg-white");
</script>

<CardButton {iconClass} {buttonClass} icon={icon} title={title}
            description={description} {cardSuffix}
            {cardClass}
            onClick={onSelect}>
</CardButton>