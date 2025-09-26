<script lang="ts">
    import type {IntegrationWebhook} from "@perfice/model/integration/integration";

    let {webhook}: { webhook: IntegrationWebhook } = $props();

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const webhookUrl = `${backendUrl}/integrations/push/${webhook.token}`;
</script>

<h2 class="text-2xl font-bold">Webhook</h2>
<p>Updates should be sent to this URL:</p>
<input class="w-full bg-white mt-2" type="text" readonly value={webhookUrl}
       onfocus={(e) => e.currentTarget.select()}/>