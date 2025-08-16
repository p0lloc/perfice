<script lang="ts">
    import {type OnboardingRegisterPage, type OnboardingSelection,} from "@perfice/model/onboarding/onboarding";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {}: {
        page: OnboardingRegisterPage,
        selectState?: OnboardingSelection[]
        updateSelectState: (selections: OnboardingSelection[]) => void
    } = $props();
</script>

<div class="h-[65vh] overflow-y-scroll scrollbar-hide flex flex-col justify-center items-center">
    <h1 class="text-4xl font-bold text-center">Disclaimer</h1>
    <p class="text-center mt-2">Perfice is free to use unlimited locally and can also be <a
            href="https://github.com/p0lloc/perfice"
            class="text-green-600">self-hosted</a>.<br> To
        sync data
        across
        devices or access third-party
        integrations, you'll need to create an account.</p>

    <p class="text text-center font-bold mt-4">You can create an account under the Settings icon after setup.</p>
</div>