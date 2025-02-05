<script lang="ts">
    import {onMount} from "svelte";
    import {NEW_GOAL_ROUTE} from "@perfice/model/goal/ui";

    let {params}: { params: Record<string, string> } = $props();

    let creating = $state<boolean>(false);

    async function newGoal(){
        creating = true;
    }

    async function loadGoal(){
        let goalId = params.goalId;
        if(goalId == NEW_GOAL_ROUTE){
            await newGoal();
            return;
        }

        console.log(goalId);
    }

    onMount(() => loadGoal());
</script>

<div class="w-1/2 mx-auto mt-8">
    <h1 class="text-4xl font-bold">{creating ? "New goal" : "Edit goal"}</h1>
</div>
