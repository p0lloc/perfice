import {
    faBook,
    faBullseye,
    faCog,
    faHome,
    faLineChart,
    faSquarePlus,
    faSun,
    faTags,
    type IconDefinition
} from "@fortawesome/free-solid-svg-icons";

export interface SidebarLink {
    icon: IconDefinition,
    path: string,
    title: string,
    showOnMobile?: boolean
    bottom?: boolean
}

export const SIDEBAR_LINKS: SidebarLink[] = [
    {icon: faHome, path: "/", title: "Home"},
    {icon: faSquarePlus, path: "/trackables", title: "Track"},
    {icon: faBook, path: "/journal", title: "Journal"},
    {icon: faBullseye, path: "/goals", title: "Goals"},
    {icon: faTags, path: "/tags", title: "Tags"},
    {icon: faLineChart, path: "/analytics", title: "Analytics", showOnMobile: false},
    {icon: faSun, path: "/reflections", title: "Reflections", showOnMobile: false},
    {icon: faCog, path: "/settings", title: "Settings", bottom: true},
];
