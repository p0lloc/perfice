<script lang="ts">
    import {type OnboardingSelection, type OnboardingSelectPage} from "@perfice/model/onboarding/onboarding";
    import OnboardingSelectButton from "@perfice/components/onboarding/OnboardingSelectButton.svelte";

    let {page, selectState, updateSelectState}: {
        page: OnboardingSelectPage,
        selectState?: OnboardingSelection[]
        updateSelectState: (selections: OnboardingSelection[]) => void
    } = $props();
</script>

<h1 class="text-4xl md:text-7xl font-bold text-gray-600">{page.title}</h1>
<p class="text-xl mt-2">{page.description}</p>
<div class="flex flex-col gap-4 mt-4 max-h-[55vh] md:max-h-[45vh] overflow-y-scroll scrollbar-hide">
    {#each page.categories as category}
        <div>
            <h2 class="mb-2 font-bold text-xl">{category.name}</h2>
            <div class="grid md:grid-cols-4 grid-cols-2 gap-2">
                {#each category.items as item}
                    <OnboardingSelectButton {updateSelectState} {selectState} isDefault={item.default}
                                            category={category.name} item={item}/>
                {/each}
            </div>
        </div>
    {/each}
</div>