<script lang="ts">
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import {WeekStart} from "@perfice/model/variable/time/time";
    import SettingsDataImport from "@perfice/components/settings/SettingsDataImport.svelte";
    import SettingsDataExport from "@perfice/components/settings/SettingsDataExport.svelte";

    const WEEK_START_ITEMS = [
        {value: WeekStart.MONDAY, name: "Monday"},
        {value: WeekStart.SUNDAY, name: "Sunday"},
        {value: WeekStart.SATURDAY, name: "Saturday"},
    ];

    function onFileChange(files: FileList) {
        console.log(files);
    }
</script>

<MobileTopBar title="Settings"/>
<div class="md:w-1/2 mx-auto md:mt-8 md:px-0 p-4 pb-20 main-content">
    <h1 class="text-4xl font-bold hidden md:block">Settings</h1>
    <div class="bg-white border p-4 rounded-xl mt-4 flex flex-col gap-4">
        <div class="row-between">
            <h3 class="settings-label">Week start</h3>

            <DropdownButton value={WeekStart.MONDAY}
                            items={WEEK_START_ITEMS} onChange={(v) => console.log(v)}/>
        </div>

        <div>
            <SettingsDataImport/>
        </div>
        <div>
            <SettingsDataExport/>
        </div>
    </div>
</div>

<style>
    :global(.settings-label) {
        @apply font-bold text-gray-500 text-xl;
    }
</style>