<script lang="ts">
    import {faPlusCircle} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {NEW_GOAL_ROUTE} from "@perfice/model/goal/ui";
    import {navigate} from "@perfice/app";

    function onClick() {
        navigate(`/goals/${NEW_GOAL_ROUTE}`);
    }
</script>

<button class="rounded-xl h-48 flex-center border-2 border-dashed text-gray-500 hover-feedback" onclick={onClick}>
    <Fa icon={faPlusCircle}/>
</button>
