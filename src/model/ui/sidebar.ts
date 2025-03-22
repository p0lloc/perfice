import {
    faBook,
    faBullseye, faHome,
    faLineChart,
    faRuler, faSquarePlus,
    faTag,
    faTags,
    type IconDefinition
} from "@fortawesome/free-solid-svg-icons";

export interface SidebarLink {
    icon: IconDefinition,
    path: string,
    title: string,
    showOnMobile?: boolean
}

export const SIDEBAR_LINKS: SidebarLink[] = [
    {icon: faHome, path: "/", title: "Home"},
    {icon: faSquarePlus, path: "/trackables", title: "Track"},
    {icon: faBook, path: "/journal", title: "Journal"},
    {icon: faBullseye, path: "/goals", title: "Goals"},
    {icon: faTags, path: "/tags", title: "Tags"},
    {icon: faLineChart, path: "/analytics", title: "Analytics", showOnMobile: false},
];
