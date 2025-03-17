import {
    faBook,
    faBullseye, faHome,
    faLineChart,
    faRuler,
    faTag,
    faTags,
    type IconDefinition
} from "@fortawesome/free-solid-svg-icons";

export interface SidebarLink {
    name: string,
    icon: IconDefinition,
    path: string,
    title: string,
    showOnMobile?: boolean
}

export const SIDEBAR_LINKS: SidebarLink[] = [
    {name: "Home", icon: faHome, path: "/", title: "Home"},
    {name: "Trackables", icon: faRuler, path: "/trackables", title: "Trackables"},
    {name: "Journal", icon: faBook, path: "/journal", title: "Journal"},
    {name: "Goals", icon: faBullseye, path: "/goals", title: "Goals"},
    {name: "Tags", icon: faTags, path: "/tags", title: "Tags"},
    {name: "Analytics", icon: faLineChart, path: "/analytics", title: "Analytics", showOnMobile: false},
];
