import type {Action} from "svelte/action";
import {mount} from "svelte";
import Fa from "svelte-fa";
import {faRotateRight} from "@fortawesome/free-solid-svg-icons";
import {integrations, sync} from "@perfice/stores";

export const pullToRefresh: Action<HTMLDivElement, {
    someProperty: boolean
} | undefined> = (node) => {
    let touchStartY = 0;
    let spinner = document.createElement("span");
    spinner.classList.add("spinner");
    mount(Fa, {
        target: spinner,
        props: {
            icon: faRotateRight
        }
    })
    spinner.style.transform = "translateY(0px)";
    node.appendChild(spinner);

    let begin = 0;
    let active = false;
    let moved = 0;
    let threshold = 50;

    function onTouchStart(e: TouchEvent) {
        touchStartY = e.touches[0].clientY;
        let bouding = node.getBoundingClientRect();
        begin = bouding.top;
        active = true;
        let n = e.target as HTMLElement;
        n.addEventListener("touchend", onTouchEnd, false);
        n.addEventListener("touchmove", onTouchMove);
        n.addEventListener("touchcancel", onTouchEnd, false);
    }

    function onTouchMove(e: TouchEvent) {
        const touchY = e.touches[0].clientY;
        const touchDiff = Math.min(touchY - touchStartY, threshold);
        active = true;
        if (touchDiff > 0 && node.scrollTop === 0) {
            spinner.style.display = "flex";
            moved = Math.min(touchY - touchStartY, threshold);
            spinner.style.top = `${begin + moved}px`;
        }
    }

    async function onTouchEnd(e: TouchEvent) {
        spinner.style.display = "none";
        let n = e.target as HTMLElement;
        n.removeEventListener("touchend", onTouchEnd);
        n.removeEventListener("touchmove", onTouchMove);
        n.removeEventListener("touchcancel", onTouchEnd);
        if (active) {
            active = false;

            if (moved == threshold) {
                await sync.refresh();
                await integrations.refresh();
            }
        }
    }

    node.addEventListener("touchstart", onTouchStart);

    return {
        destroy() {
            node.removeEventListener("touchstart", onTouchStart);
        }
    }
}
