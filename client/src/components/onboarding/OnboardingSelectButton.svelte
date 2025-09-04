<script lang="ts">
    import Icon from "@perfice/components/base/icon/Icon.svelte";
    import type {OnboardingCategoryItem, OnboardingSelection} from "@perfice/model/onboarding/onboarding";

    let {category, item, selectState, updateSelectState, isDefault}: {
        category: string,
        item: OnboardingCategoryItem,
        isDefault: boolean,
        selectState?: OnboardingSelection[],
        updateSelectState: (selections: OnboardingSelection[]) => void
    } = $props();

    function onClick() {
        if (selectState == null || isDefault) return;

        if (selected) {
            updateSelectState($state.snapshot(selectState).filter(s => s.item != item.name));
        } else {
            updateSelectState([...$state.snapshot(selectState), {category: category, item: item.name, default: false}]);
        }
    }

    let selected = $derived(selectState?.some(s => s.category == category && s.item == item.name) ?? false);
    let feedbackClass = $derived.by(() => {
        if (isDefault) return "cursor-default";

        return selected ? "pointer-feedback:bg-green-200" : "hover-feedback";
    })
    let buttonClass = $derived(selected ? `bg-white border-green-500 bg-green-100` : " bg-white");
</script>

<button onclick={onClick}
        class:min-h-28={item.icon != null}
        class="{buttonClass} {feedbackClass} border-2 rounded-xl py-2 px-4 flex flex-col gap-2 justify-center items-center">

    {#if item.icon}
        <Icon name={item.icon} class="text-2xl"/>
    {/if}
    <div class="flex flex-col">
        <span class:text-lg={item.icon != null}>{item.name}</span>
        {#if isDefault}
            <span class="text-[10px]">Default</span>
        {/if}
    </div>
</button>