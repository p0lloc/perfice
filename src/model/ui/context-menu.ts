import type {IconDefinition} from "@fortawesome/free-solid-svg-icons";

export type CloseContextMenuCallback = () => void;
let openedContextMenus: CloseContextMenuCallback[] = [];

export function openContextMenu(callback: CloseContextMenuCallback) {
    openedContextMenus.push(callback);
}

export function removeContextMenuCallback(callback: CloseContextMenuCallback) {
    openedContextMenus = openedContextMenus.filter(c => c != callback);
}

export function closeContextMenus() {
    openedContextMenus.forEach((callback) => callback());
    openedContextMenus = [];
}

export interface ContextMenuButton {
    name: string;
    icon: IconDefinition | null;
    action: () => void;
}
