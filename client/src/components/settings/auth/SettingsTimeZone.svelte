<script lang="ts">
    import {TIME_ZONES} from "@perfice/model/ui/timezone";
    import {auth} from "@perfice/stores";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";

    let timeZoneItems = TIME_ZONES.map((tz) => ({
        name: tz,
        value: tz,
    }));

    function changeTimeZone(tz: string) {
        auth.setTimezone(tz);
    }
</script>

{#if $auth}
    <div class="flex gap-2 justify-between items-center flex-wrap mt-4">
        <h3 class="settings-label">Time zone</h3>

        <DropdownButton
                class="w-full md:w-auto"
                search={true}
                value={$auth.timezone}
                onChange={changeTimeZone}
                items={timeZoneItems}
        />
    </div>
{/if}