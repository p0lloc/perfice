<script lang="ts">

    let {onGoLeft, onGoRight}: { onGoLeft: () => void, onGoRight: () => void } = $props();
    let startX = 0;

    function onTouchStart(e: TouchEvent) {
        startX = e.touches[0].clientX;
    }

    function onTouchMove(e: TouchEvent) {
        if (startX == 0) return;

        const x = e.touches[0].clientX;
        let diffX = x - startX;
        if (Math.abs(diffX) < 70) return;

        if (diffX > 0) {
            onGoLeft();
        } else {
            onGoRight();
        }

        startX = 0;
    }
</script>
<svelte:window ontouchstart={onTouchStart} ontouchmove={onTouchMove}/>
