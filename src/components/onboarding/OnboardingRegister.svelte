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

<div class="max-h-[75vh] md:max-h-[75vh] overflow-y-scroll scrollbar-hide">
    <h1 class="text-4xl font-bold text-center">Create account</h1>
    <p class="text-center mt-2">Perfice is free to use unlimited locally and can also be <a
            href="https://github.com/p0lloc/perfice"
            class="text-green-600">self-hosted</a>.<br><br> To
        sync data
        across
        devices or access third-party
        integrations, you'll need to create an account.</p>

    <div class="flex items-center mt-8">
        <p class="text-sm text-center font-bold">You can create an account under the Settings icon after setup.</p>
    </div>
</div>