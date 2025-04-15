import type {OnboardingSelection, OnboardingSelectType} from "@perfice/model/onboarding/onboarding";
import {goto} from "@mateothegreat/svelte5-router";

const ONBOARDING_KEY = "onboarded";
const FINISH_ROUTE = "/";

export const ONBOARDING_ROUTE = "/onboarding";

export class OnboardingStore {

    onboardNewUser() {
        if (localStorage.getItem(ONBOARDING_KEY) != null) {
            goto(FINISH_ROUTE);
        } else {
            goto(ONBOARDING_ROUTE);
        }
    }

    finalize(selectedState: Record<OnboardingSelectType, OnboardingSelection[]>) {
        localStorage.setItem(ONBOARDING_KEY, "true");
        goto(FINISH_ROUTE);
    }
}