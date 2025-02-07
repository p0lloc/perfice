<script lang="ts">
    import {faPlusCircle} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {goto} from "@mateothegreat/svelte5-router";
    import {NEW_GOAL_ROUTE} from "@perfice/model/goal/ui";

    function onClick(){
        goto(`/goals/${NEW_GOAL_ROUTE}`);
    }
</script>

<button class="rounded-xl h-48 flex-center border-2 border-dashed text-gray-500 hover-feedback" onclick={onClick}>
    <Fa icon={faPlusCircle} />
</button>
