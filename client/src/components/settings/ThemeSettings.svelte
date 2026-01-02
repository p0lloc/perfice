<script lang="ts">
    import { darkMode, setDarkMode } from "@perfice/stores/ui/darkmode";
    import SegmentedControl from "../base/segmented/SegmentedControl.svelte";
</script>

<h3 class="settings-label">Theme (experimental)</h3>
<div class="mt-2">
    <SegmentedControl
        class="w-64"
        segments={[
            {
                name: "Light",
                value: false,
            },
            {
                name: "Dark",
                value: true,
            },
        ]}
        value={$darkMode}
        onChange={(v) => setDarkMode(v)}
    />
</div>
