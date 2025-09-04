import type {IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface OpenedContextMenu {
    callback: CloseContextMenuCallback;
    initiator: HTMLElement;
}

export type CloseContextMenuCallback = () => void;
let openedContextMenus: OpenedContextMenu[] = [];

export function openContextMenu(callback: CloseContextMenuCallback, initiator: HTMLElement) {
    openedContextMenus.push({callback, initiator});
}

export function removeContextMenuCallback(callback: CloseContextMenuCallback) {
    openedContextMenus = openedContextMenus.filter(menu => menu.callback != callback);
}

export function closeContextMenus(initiator: HTMLElement) {
    // Close all context menus that aren't opened by the initiator
    openedContextMenus
        .filter(menu => menu.initiator != initiator)
        .forEach((menu) => menu.callback());
    openedContextMenus = [];
}

export interface ContextMenuButton {
    name: string;
    icon: IconDefinition | null;
    separated?: boolean;
    action: () => void;
}
