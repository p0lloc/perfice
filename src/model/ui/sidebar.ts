import {faBook, faBullseye, faRuler, type IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface SidebarLink {
    name: string,
    icon: IconDefinition,
    path: string,
    title: string
}

export const SIDEBAR_LINKS: SidebarLink[] = [
    {name: "Trackables", icon: faRuler, path: "/", title: "Trackables"},
    {name: "Journal", icon: faBook, path: "/journal", title: "Journal"},
    {name: "Goals", icon: faBullseye, path: "/goals", title: "Goals"},
];
