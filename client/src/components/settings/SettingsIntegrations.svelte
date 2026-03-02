<script lang="ts">
    import {RemoteType} from "@perfice/services/remote/remote";
    import RemoteSettingsSection from "@perfice/components/settings/RemoteSettingsSection.svelte";
    import {auth} from "@perfice/stores";
</script>

<div class="settings-container">
    <RemoteSettingsSection remoteType={RemoteType.INTEGRATION}/>
    {#if !$auth}
        <p>You are not logged in, only local integrations will be available.</p>
    {/if}
</div>