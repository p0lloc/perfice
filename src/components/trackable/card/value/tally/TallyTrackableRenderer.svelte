<script lang="ts">
    import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import type {
        TrackableValueSettings
    } from "@perfice/model/trackable/trackable";
    import type {TallyTrackableValueSettings} from "@perfice/model/trackable/trackable.js";

    let {values, cardSettings}: {
        values: PrimitiveValue[],
        cardSettings: TrackableValueSettings,
        valueSettings: TallyTrackableValueSettings,
        date: Date
    } = $props();
</script>
