<script lang="ts">
    import {
        createOnboardingSelectState,
        ONBOARDING,
        OnboardingPageType,
        type OnboardingSelection
    } from "@perfice/model/onboarding/onboarding";
    import OnboardingPageNavigation from "@perfice/components/onboarding/OnboardingPageNavigation.svelte";
    import OnboardingImage from "@perfice/components/onboarding/OnboardingImage.svelte";
    import OnboardingSelect from "@perfice/components/onboarding/OnboardingSelect.svelte";
    import type {Component} from "svelte";
    import SwipeDetector from "@perfice/components/base/gesture/SwipeDetector.svelte";
    import {onboarding} from "@perfice/stores";

    let page = $state(0);
    let current = $derived(ONBOARDING[page]);
    let selectedState = $state(createOnboardingSelectState());

    function navigate(newPage: number) {
        if (newPage < 0) return;

        if (newPage >= ONBOARDING.length) {
            finalize();
            return;
        }

        page = newPage;
    }

    function finalize() {
        onboarding.finalize($state.snapshot(selectedState));
    }

    function updateSelectState(selections: OnboardingSelection[]) {
        if (current.pageType != OnboardingPageType.SELECT) return;

        selectedState[current.selectType] = selections;
    }

    const RENDERERS: Record<OnboardingPageType, Component<{
        page: any,
        selectState?: OnboardingSelection[],
        updateSelectState: (selections: OnboardingSelection[]) => void
    }>> = {
        [OnboardingPageType.IMAGE]: OnboardingImage,
        [OnboardingPageType.SELECT]: OnboardingSelect
    };

    const RendererComponent = $derived(RENDERERS[current.pageType]);
    const currentSelectState = $derived.by<OnboardingSelection[] | undefined>(() => {
        if (current.pageType != OnboardingPageType.SELECT) return undefined;

        return selectedState[current.selectType];
    });
</script>

<SwipeDetector onGoLeft={() => navigate(page - 1)} onGoRight={() => navigate(page + 1)}/>
<div class="flex flex-col p-10 mx-auto w-screen 2xl:w-1/2 md:w-[70%] md:mt-10 gap-[3rem]">
    <div class="md:h-[55vh] h-[65vh]">
        <RendererComponent page={current} selectState={currentSelectState} updateSelectState={updateSelectState}/>
    </div>
    <OnboardingPageNavigation onSkip={finalize} max={ONBOARDING.length} {navigate} {page}/>
</div>