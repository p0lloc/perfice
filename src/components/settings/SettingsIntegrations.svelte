<script lang="ts">
    import {auth} from "@perfice/stores";
    import {RemoteType} from "@perfice/services/remote/remote";
    import RemoteSettingsSection from "@perfice/components/settings/RemoteSettingsSection.svelte";
</script>

{#if $auth}
    <div class="settings-container">
        <RemoteSettingsSection remoteType={RemoteType.INTEGRATION}/>
        show all authenticated and ability to disconnect
    </div>
{/if}
