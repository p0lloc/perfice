<script lang="ts">
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import {WeekStart} from "@perfice/model/variable/time/time";
    import SettingsDataImport from "@perfice/components/settings/SettingsDataImport.svelte";
    import SettingsDataExport from "@perfice/components/settings/SettingsDataExport.svelte";
    import {weekStart} from "@perfice/stores";
    import SettingsDeleteData from "@perfice/components/settings/SettingsDeleteData.svelte";

    const WEEK_START_ITEMS = [
        {value: WeekStart.MONDAY, name: "Monday"},
        {value: WeekStart.SUNDAY, name: "Sunday"},
        {value: WeekStart.SATURDAY, name: "Saturday"},
    ];

    function onWeekStartChange(newValue: WeekStart) {
        weekStart.setWeekStart(newValue);
    }

    function onDeleteData() {

    }
</script>

<MobileTopBar title="Settings"/>
<div class="center-view md:mt-8 md:px-0 p-4 pb-20 main-content">
    <h1 class="text-4xl font-bold hidden md:block">Settings</h1>
    <div class="bg-white border p-4 rounded-xl mt-4 flex flex-col gap-4">
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

        <div>
            <SettingsDeleteData/>
        </div>
    </div>
</div>

<style>
    :global(.settings-label) {
        @apply font-bold text-gray-500 text-xl;
    }
</style>