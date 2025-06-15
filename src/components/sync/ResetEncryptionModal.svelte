<script lang="ts">
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {sync} from "@perfice/stores";

    let modal: Modal;
    let password = $state("");

    async function onConfirm() {
        await sync.resetEncryptionPassword(password);
        modal.close();
    }

    export function open() {
        password = "";
        modal.open();
    }
</script>

<Modal type={ModalType.CONFIRM_CANCEL} title="Set encryption password" bind:this={modal} onConfirm={onConfirm}
       confirmText="Set password"
       size={ModalSize.MEDIUM}>

    <div class="flex flex-col gap-4">
        <p>When you set a new password, all data will be stored re-encrypted. You must set the same password on all
            devices to
            access your data.</p>
        <p class="mt-2 flex items-center gap-2 text-red-500 font-bold">
            <Fa icon={faExclamationTriangle}/>
            There is no way to recover your synced data if you forget the password.
        </p>
        <input type="password" bind:value={password} placeholder="Encryption password" class="input"/>
    </div>
</Modal>
