<script lang="ts">
    import {type CorrelationDisplayPart, ellipsis} from "@perfice/services/analytics/display";
    import {DatasetKeyType} from "@perfice/services/analytics/analytics";
    import {
        faArrowDown,
        faArrowUp,
        faCalendarWeek,
        faLayerGroup,
        faTag,
        type IconDefinition
    } from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {part, positive}: { part: CorrelationDisplayPart, positive: boolean } = $props();

    function getIcon(keyType: DatasetKeyType, positive: boolean): IconDefinition {
        switch (keyType) {
            case DatasetKeyType.CATEGORICAL:
                return faLayerGroup;
            case DatasetKeyType.TAG:
                return faTag;
            case DatasetKeyType.WEEK_DAY:
                return faCalendarWeek;
            case DatasetKeyType.QUANTITATIVE:
                return positive ? faArrowUp : faArrowDown;
        }
    }
</script>

<span class="items-center gap-1 flex" title={part.msg}>
    <Fa icon={getIcon(part.type, positive)} class="w-3"/>
    {ellipsis(part.msg, 20)}
</span>

<style>
    span {
        @apply bg-gray-200 rounded-md px-2;
    }
</style>