<script lang="ts">
    import {subscribeToEventStore} from "@perfice/util/event";
    import IntegrationUnauthenticatedModal
        from "@perfice/components/integration/modals/IntegrationUnauthenticatedModal.svelte";
    import {unauthenticatedIntegrationEvents} from "@perfice/stores/remote/integration";
    import type {UnauthenticatedIntegrationError} from "@perfice/model/integration/ui";

    let unauthenticatedIntegrationModal: IntegrationUnauthenticatedModal;

    $effect(() => {
        subscribeToEventStore($unauthenticatedIntegrationEvents, unauthenticatedIntegrationEvents, (errors: UnauthenticatedIntegrationError[]) => {
            unauthenticatedIntegrationModal.open(errors);
        });
    });
</script>

<IntegrationUnauthenticatedModal bind:this={unauthenticatedIntegrationModal}/>