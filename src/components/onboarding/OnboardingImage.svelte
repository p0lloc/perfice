<script lang="ts">
    import type {OnboardingImagePage} from "@perfice/model/onboarding/onboarding";
    import {BASE_URL} from "@perfice/app.js";

    let {page}: { page: OnboardingImagePage } = $props();
</script>

<div class="bg-gray-300 rounded-xl w-full h-[60vh] md:h-[50vh] border-2 shadow-md">
    <img src={`${BASE_URL}/${page.desktopImage}`} alt="Onboarding" class="image hidden md:block"/>
    <img src={`${BASE_URL}/${page.mobileImage}`} alt="Onboarding" class="image md:hidden"/>
</div>
<div class="flex-col flex justify-between mt-4">
    <div class="md:text-center">
        <h1 class="text-4xl md:text-7xl font-bold text-gray-600">{page.title}</h1>
        <p class="md:text-3xl text-2xl text-gray-500 mt-2">{page.description}</p>
    </div>
</div>

<style>
    .image {
        @apply rounded-xl object-cover w-full h-full;
    }
</style>