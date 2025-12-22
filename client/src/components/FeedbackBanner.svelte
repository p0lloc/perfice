<script lang="ts">
    import {faTimes} from "@fortawesome/free-solid-svg-icons";
    import {navigate} from "@perfice/app";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    const KEY = "feedbackDismissed";

    let dismissed: boolean = localStorage.getItem(KEY) != null;

    function onFeedback() {
        navigate("/feedback");
    }

    function dismiss() {
        dismissed = true;
        localStorage.setItem(KEY, "true");
    }
</script>

{#if !dismissed}
    <div class="border-b dark-border py-2 px-4 hidden md:flex items-center gap-4 justify-between">
        <div class="text-xs">
            Perfice is currently under alpha, please let us know of your feedback!
        </div>
        <div class="flex items-center gap-2">
            <button class="text-xs bg-green-600 hover:bg-green-700 text-white py-1 px-2 font-bold rounded-xl"
                    onclick={onFeedback}>Send
                feedback
            </button>
            <button onclick={dismiss} class="hover:text-gray-500">
                <Fa icon={faTimes} size="1.2x"/>
            </button>
        </div>
    </div>
{/if}
