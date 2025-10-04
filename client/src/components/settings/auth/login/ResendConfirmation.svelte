<script lang="ts">
    import Button from "@perfice/components/base/button/Button.svelte";
    import {auth} from "@perfice/stores";

    let {email}: { email: string } = $props();

    let sent = $state(false);

    async function resendConfirmationEmail() {
        if (!(await auth.resendConfirmationEmail(email))) return;

        sent = true;
    }
</script>

{#if !sent}
    <Button onClick={resendConfirmationEmail} class="text-xs self-start">Resend confirmation email</Button>
{:else}
    <p class="text-green-500">Successfully resent email</p>
{/if}
