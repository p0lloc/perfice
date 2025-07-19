<script lang="ts">
    import {type OnboardingRegisterPage, type OnboardingSelection,} from "@perfice/model/onboarding/onboarding";

    let {}: {
        page: OnboardingRegisterPage,
        selectState?: OnboardingSelection[]
        updateSelectState: (selections: OnboardingSelection[]) => void
    } = $props();
</script>

<h1 class="text-4xl font-bold">Creating an account</h1>
<p>Perfice is free to use unlimited locally and can also be <a href="" class="text-green-600">self-hosted</a>.<br> To
    sync data
    across
    devices or access third-party
    integrations, you'll need to create an account.</p>

<div class="flex w-3/5 mx-auto gap-4 mt-16">
    <div class="bg-white border p-4 rounded-xl flex-1">
        <h2 class="text-2xl font-bold text-center">Free</h2>
        <ul class="my-4">
            <li>10 trackables</li>
            <li>1 dashboard</li>
            <li>1 integration</li>
            <li>15 tags</li>
        </ul>
        <p class="text-lg text-gray-500 mt-2 text-center">Free forever</p>
    </div>
    <div class="bg-white border p-4 rounded-xl flex-1">
        <h2 class="text-2xl font-bold text-center">Premium</h2>
        <ul class="my-4">
            <li>Unlimited trackables</li>
            <li>Unlimited dashboard</li>
            <li>Unlimited integration</li>
            <li>Unlimited tags</li>
        </ul>
        <p class="text-lg text-gray-500 mt-2 text-center">$2.99/month</p>
    </div>
</div>
<p class="text-sm text-center mt-8">You can create an account under the Settings icon after setup.</p>