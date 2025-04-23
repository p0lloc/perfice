<script lang="ts">
    import Icon from "@perfice/components/base/icon/Icon.svelte";
    import type {OnboardingCategoryItem, OnboardingSelection} from "@perfice/model/onboarding/onboarding";

    let {category, item, selectState, updateSelectState}: {
        category: string,
        item: OnboardingCategoryItem,
        selectState?: OnboardingSelection[],
        updateSelectState: (selections: OnboardingSelection[]) => void
    } = $props();

    function onClick() {
        if (selectState == null) return;

        if (selected) {
            updateSelectState($state.snapshot(selectState).filter(s => s.item != item.name));
        } else {
            updateSelectState([...$state.snapshot(selectState), {category: category, item: item.name}]);
        }
    }

    let selected = $derived(selectState?.some(s => s.category == category && s.item == item.name) ?? false);
    let buttonClass = $derived(selected ? "pointer-feedback:bg-green-100 bg-white border-1 border-green-500 bg-green-50" : "hover-feedback bg-white");
</script>

<button onclick={onClick}
        class:min-h-28={item.icon != null}
        class="{buttonClass} hover-feedback border rounded-xl py-2 px-4 flex flex-col gap-2 justify-center items-center">

    {#if item.icon}
        <Icon name={item.icon} class="text-xl"/>
    {/if}
    <span class:text-lg={item.icon != null}>{item.name}</span>
</button>