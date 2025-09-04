<script lang="ts">
    import {ButtonColor} from "@perfice/model/ui/button.js";
    import {faCheck} from "@fortawesome/free-solid-svg-icons";
    import Button from "@perfice/components/base/button/Button.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {onBack}: { onBack: () => void } = $props();
</script>

<Button class="flex justify-center items-center" color={ButtonColor.WHITE} onClick={onBack}>
    <Fa icon={faCheck}/>
</Button>
