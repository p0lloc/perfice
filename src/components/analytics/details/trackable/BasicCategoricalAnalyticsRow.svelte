<script lang="ts">
    import {faArrowDown, faArrowUp} from "@fortawesome/free-solid-svg-icons";
    import type {CategoricalBasicAnalytics} from "@perfice/services/analytics/analytics";
    import TitledCard from "@perfice/components/base/card/TitledCard.svelte";

    let {analytics}: { analytics: CategoricalBasicAnalytics } = $props();
</script>
<TitledCard
        class="flex-1"
        title="Most common"
        icon={faArrowUp}
        description={analytics.mostCommon.category}
></TitledCard>
<TitledCard
        class="flex-1 rounded-xl"
        title="Least common"
        icon={faArrowDown}
        description={analytics.leastCommon.category}
></TitledCard>
