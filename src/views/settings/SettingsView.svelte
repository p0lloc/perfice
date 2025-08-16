<script lang="ts">
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import {WeekStart} from "@perfice/model/variable/time/time";
    import SettingsDataImport from "@perfice/components/settings/SettingsDataImport.svelte";
    import SettingsDataExport from "@perfice/components/settings/SettingsDataExport.svelte";
    import {remote, sync, weekStart} from "@perfice/stores";
    import SettingsDeleteData from "@perfice/components/settings/SettingsDeleteData.svelte";
    import Button from "@perfice/components/base/button/Button.svelte";
    import SettingsAccount from "@perfice/components/settings/SettingsAccount.svelte";
    import SettingsSync from "@perfice/components/settings/SettingsSync.svelte";
    import SettingsIntegrations from "@perfice/components/settings/SettingsIntegrations.svelte";
    import {RemoteType} from "@perfice/services/remote/remote";
    import {navigate} from "@perfice/app";

    const WEEK_START_ITEMS = [
        {value: WeekStart.MONDAY, name: "Monday"},
        {value: WeekStart.SUNDAY, name: "Sunday"},
        {value: WeekStart.SATURDAY, name: "Saturday"},
    ];

    function onWeekStartChange(newValue: WeekStart) {
        weekStart.setWeekStart(newValue);
    }
</script>

<MobileTopBar title="Settings"/>
<div class="center-view md:mt-8 md:px-0 p-4 pb-20 main-content">
    <h1 class="text-4xl font-bold hidden md:block">Settings</h1>
    <div class="bg-white border p-4 rounded-xl mt-4 flex flex-col gap-4">
        <SettingsAccount/>
    </div>
    <SettingsSync/>
    <SettingsIntegrations/>
    <div class="bg-white border p-4 rounded-xl mt-4 flex flex-col gap-4">
        {#if import.meta.env.DEV}
            <div class="mt-8 flex flex-col gap-4">
                <Button onClick={() => sync.fullPull(true)}>Full pull</Button>
                <Button onClick={() => sync.fullPull(false)}>Check mismatch</Button>
                <Button onClick={async () => alert(Object.entries(await sync.calculateChecksums()).map(([k, v]) => `${k}: ${v.substring(0,5)}`).join(" "))}>
                    Calculate checksums
                </Button>
            </div>
        {/if}
        <div class="row-between">
            <h3 class="settings-label">Week start</h3>

            <DropdownButton value={$weekStart}
                            items={WEEK_START_ITEMS} onChange={onWeekStartChange}/>
        </div>

        <div class="flex gap-4 md:gap-8 flex-wrap">
            <div>
                <SettingsDataImport/>
            </div>

            <div>
                <SettingsDataExport/>
            </div>
        </div>

        {#if !remote.isRemoteEnabled(RemoteType.AUTH)}
            <div>
                <SettingsDeleteData/>
            </div>
        {/if}
        <div class="mt-4">
            <Button onClick={() => navigate("/feedback")}>Send feedback</Button>
        </div>
    </div>
</div>

<style>
    @reference "@perfice/app.css";
    :global(.settings-label) {
        @apply font-bold text-gray-500 text-xl;
    }

    :global(.settings-container) {
        @apply bg-white border p-4 rounded-xl mt-4 flex flex-col gap-4;
    }
</style>