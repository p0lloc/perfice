import {TRACKABLE_SUGGESTIONS} from "@perfice/model/trackable/suggestions";
import {TAG_SUGGESTIONS} from "@perfice/model/tag/suggestions";

export enum OnboardingPageType {
    IMAGE = "IMAGE",
    SELECT = "SELECT"
}

export interface OnboardingCategoryItem {
    icon?: string;
    name: string;
    default: boolean;
}

export interface OnboardingCategory {
    name: string;
    items: OnboardingCategoryItem[];
}

export enum OnboardingSelectType {
    TRACKABLE = "TRACKABLE",
    TAG = "TAG"
}

export interface OnboardingSelectPage {
    pageType: OnboardingPageType.SELECT;
    title: string;
    description: string;
    selectType: OnboardingSelectType;
    categories: OnboardingCategory[];
}

export interface OnboardingImagePage {
    pageType: OnboardingPageType.IMAGE;
    title: string;
    description: string;
    desktopImage: string;
    mobileImage: string;
}

export type OnboardingPage = OnboardingImagePage | OnboardingSelectPage;

export const ONBOARDING: OnboardingPage[] = [
    {
        pageType: OnboardingPageType.IMAGE,
        title: "Dashboard",
        description: "See everything in one place",
        desktopImage: "dashboard-onboarding.png",
        mobileImage: "dashboard-onboarding-mobile.png"
    },
    {
        pageType: OnboardingPageType.IMAGE,
        title: "Trackables",
        description: "Track anything you can think of",
        desktopImage: "trackables-onboarding.png",
        mobileImage: "trackables-onboarding-mobile.png"
    },
    {
        pageType: OnboardingPageType.SELECT,
        selectType: OnboardingSelectType.TRACKABLE,
        title: "Trackables",
        description: "Here are some suggestions you can choose from!",
        categories: TRACKABLE_SUGGESTIONS.map(g => {
            return {
                name: g.name,
                items: g.suggestions?.map(s => {
                    return {
                        name: s.name,
                        icon: s.icon,
                        default: s.default === true
                    }
                }) ?? []
            }
        })
    },
    {
        pageType: OnboardingPageType.IMAGE,
        title: "Goals",
        description: "Set goals and stay on track",
        desktopImage: "goals-onboarding.png",
        mobileImage: "goals-onboarding-mobile.png"
    },
    {
        pageType: OnboardingPageType.IMAGE,
        title: "Tags",
        description: "Tag your daily experiences with one tap",
        desktopImage: "tags-onboarding.png",
        mobileImage: "tags-onboarding-mobile.png"
    },
    {
        pageType: OnboardingPageType.SELECT,
        selectType: OnboardingSelectType.TAG,
        title: "Tags",
        description: "Select some tags to get started with",
        categories: TAG_SUGGESTIONS.map(g => {
            return {
                name: g.name,
                items: g.suggestions.map(s => {
                    return {
                        name: s.name,
                        default: false
                    }
                })
            }
        })
    },
    {
        pageType: OnboardingPageType.IMAGE,
        title: "Analytics",
        description: "See what makes a difference",
        desktopImage: "analytics-onboarding.png",
        mobileImage: "analytics-onboarding-mobile.png"
    },
]

export interface OnboardingSelection {
    category: string;
    item: string;
    default: boolean;
}

export function createOnboardingSelectState(): Record<OnboardingSelectType, OnboardingSelection[]> {
    return {
        [OnboardingSelectType.TRACKABLE]: TRACKABLE_SUGGESTIONS
            .flatMap(g => g.suggestions?.filter(s => s.default === true)
                .map(s => ({
                    category: g.name,
                    item: s.name,
                    default: true
                })) ?? []),
        [OnboardingSelectType.TAG]: []
    }
}