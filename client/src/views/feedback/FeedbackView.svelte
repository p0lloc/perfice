<script lang="ts">
    import Button from "@perfice/components/base/button/Button.svelte";
    import {feedback} from "@perfice/stores";

    let message = $state("");
    let sent = $state(false);

    function sendFeedback() {
        feedback.sendFeedback(message);
        message = "";
        sent = true;
    }
</script>

<div class="p-8">
    <h2 class="text-3xl font-bold">Send feedback</h2>
    <p>Found any bugs or want to see a new feature added? Let us know below!</p>

    <div class="mt-4">
        <textarea bind:value={message} placeholder="Your feedback" rows="10" cols="10"
                  class="w-full md:w-1/3 dark:bg-gray-700 default-border bg-white"></textarea>
    </div>

    {#if !sent}
        <Button class="mt-2" onClick={sendFeedback}>Send feedback</Button>
    {:else}
        <p class="mt-2"><b>Thank you for your feedback! ❤️</b></p>
    {/if}
</div>