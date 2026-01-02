<script lang="ts">
    import ConfigureUrlModal from "@perfice/components/settings/ConfigureUrlModal.svelte";
    import {remote} from "@perfice/stores";
    import {REMOTE_NAMES, RemoteType} from "@perfice/services/remote/remote";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {faGlobe} from "@fortawesome/free-solid-svg-icons";

    let configureUrlModal: ConfigureUrlModal;
    let {remoteType, onEnableToggle, showEnableToggle = true}: {
        remoteType: RemoteType,
        onEnableToggle?: (value: boolean) => void,
        showEnableToggle?: boolean
    } = $props();

    function configureUrl() {
        configureUrlModal.open(remote.getRemoteUrl(remoteType));
    }

    function onEnabledChange(e: { currentTarget: HTMLInputElement }) {
        let checked = e.currentTarget.checked;
        remote.setRemoteEnabled(remoteType, checked);
        onEnableToggle?.(checked);
    }

    function onConfigure(url: string) {
        remote.setRemoteUrl(remoteType, url);
    }
</script>

<ConfigureUrlModal onConfigure={onConfigure} bind:this={configureUrlModal}/>
<div class="row-between">
    <h3 class="font-bold text-gray-500 dark:text-white text-2xl">{REMOTE_NAMES[remoteType]}</h3>

    <IconButton class="text-gray-500 dark:text-white" icon={faGlobe}
                onClick={configureUrl}/>
</div>

{#if showEnableToggle}
    <div class="row-between">
        <h3 class="settings-label">Enabled</h3>

        <input type="checkbox" class="border" checked={remote.isRemoteEnabled(remoteType)} onchange={onEnabledChange}/>
    </div>
{/if}
