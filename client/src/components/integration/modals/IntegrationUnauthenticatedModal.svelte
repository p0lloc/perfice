<script lang="ts">
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal.js";
    import type {UnauthenticatedIntegrationError} from "@perfice/model/integration/ui";

    let errors = $state<UnauthenticatedIntegrationError[]>([]);
    let modal: Modal;

    export function open(events: UnauthenticatedIntegrationError[]) {
        errors = events;
        modal.open();
    }
</script>

<Modal title="Integration not authenticated" bind:this={modal} size={ModalSize.MEDIUM} type={ModalType.CANCEL}
       cancelText="Close">
    <div class="flex flex-col gap-2">
        <div>
            {#each errors as error}
                <p>Integration {error.integrationTypeName} is not authenticated, please authenticate or remove it.

                    <br/>
                    Connected forms: {error.forms.join(", ")}</p>
            {/each}
        </div>
    </div>
</Modal>