export function longPress(node: HTMLElement) {
    const TIME_MS = 500;
    const MOUSE_TIME_MS = 0;
    let timeoutPtr: number;
    let isTouchEvent = false;
    let initialY: number;
    let isGrabbed = false;
    let isDragging = false;
    let initialTouchPos = {x: 0, y: 0};

    function handleStart(e: TouchEvent | MouseEvent) {
        if (!e.isTrusted) return; // Prevent redispatch from infinitely looping

        isTouchEvent = e.type === 'touchstart';
        if (isTouchEvent) {
            let event = e as TouchEvent;
            initialY = event.touches[0].clientY;
            initialTouchPos = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
            window.addEventListener('touchmove', handleMoveBeforeLong, {passive: true});

            timeoutPtr = window.setTimeout(() => {
                isGrabbed = true;
                window.removeEventListener('touchmove', handleMoveBeforeLong);
                window.addEventListener('touchmove', handleMoveAfterLong, {passive: false});
                node.dispatchEvent(new CustomEvent('long'));
                window.setTimeout(() => node.dispatchEvent(e), 0);
            }, TIME_MS);
        } else {
            timeoutPtr = window.setTimeout(() => {
                isGrabbed = true;
                node.dispatchEvent(new CustomEvent('long'));
                window.setTimeout(() => node.dispatchEvent(e), 0);
            }, MOUSE_TIME_MS);
        }
    }

    function handleMoveBeforeLong(e: TouchEvent) {
        if (isTouchEvent && !isGrabbed) {
            const currentY = e.touches[0].clientY;
            if (Math.abs(currentY - initialY) > 5) {
                window.clearTimeout(timeoutPtr);
                window.removeEventListener('touchmove', handleMoveBeforeLong);
            }
        }
    }

    function handleMoveAfterLong(e: TouchEvent) {
        if (!isDragging) {
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - initialTouchPos.x);
            const deltaY = Math.abs(touch.clientY - initialTouchPos.y);

            if (deltaX > 5 || deltaY > 5) {
                // Prevent scrolling while dragging an item
                document.body.classList.add("lock-screen");
                isDragging = true;
            }
        }
    }

    function handleEnd() {
        if (isTouchEvent) {
            window.clearTimeout(timeoutPtr);
            window.removeEventListener('touchmove', handleMoveBeforeLong);
            window.removeEventListener('touchmove', handleMoveAfterLong);
            isGrabbed = false;
            isDragging = false;
        } else {
            window.clearTimeout(timeoutPtr);
            if (isGrabbed) {
                node.dispatchEvent(new CustomEvent('long')); // Trigger release
            }
            isGrabbed = false;
        }
    }

    node.style.userSelect = 'none';

    node.addEventListener('mousedown', handleStart, {passive: false});
    node.addEventListener('mouseup', handleEnd);
    node.addEventListener('mouseleave', handleEnd);
    node.addEventListener('touchstart', handleStart, {passive: true});
    node.addEventListener('touchend', handleEnd);

    return {
        destroy: () => {

            node.removeEventListener('mousedown', handleStart);
            node.removeEventListener('mouseup', handleEnd);
            node.removeEventListener('mouseleave', handleEnd);
            node.removeEventListener('touchstart', handleStart);
            node.removeEventListener('touchend', handleEnd);
            window.removeEventListener('touchmove', handleMoveBeforeLong);
            window.removeEventListener('touchmove', handleMoveAfterLong);

            node.style.userSelect = '';
        }
    };
}
