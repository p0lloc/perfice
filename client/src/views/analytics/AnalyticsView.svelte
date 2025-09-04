<script lang="ts">
    import SegmentedControl from "@perfice/components/base/segmented/SegmentedControl.svelte";
    import Title from "@perfice/components/base/title/Title.svelte";
    import {faChartLine} from "@fortawesome/free-solid-svg-icons";
    import {ANALYTICS_SEGMENTED_ITEMS, AnalyticsViewType,} from "@perfice/model/analytics/ui";
    import AnalyticsTrackableView from "@perfice/components/analytics/trackable/AnalyticsTrackableView.svelte";
    import AnalyticsTagView from "@perfice/components/analytics/tag/AnalyticsTagView.svelte";
    import AnalyticsCorrelationView from "@perfice/components/analytics/AnalyticsCorrelationView.svelte";
    import type {Component} from "svelte";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";

    let viewType = $state(AnalyticsViewType.TRACKABLES);

    function changeView(value: AnalyticsViewType) {
        viewType = value;
    }

    const VIEWS: Record<
        AnalyticsViewType,
        Component
    > = {
        [AnalyticsViewType.TRACKABLES]: AnalyticsTrackableView,
        [AnalyticsViewType.TAGS]: AnalyticsTagView,
        [AnalyticsViewType.CORRELATIONS]: AnalyticsCorrelationView,
    };

    let RendererComponent = $derived(VIEWS[viewType]);
</script>

<MobileTopBar title="Analytics"/>
<div class="center-view md:mt-8 md:p-0 p-2 md:border-none border-b">
    <Title title="Analytics" icon={faChartLine}/>
    <SegmentedControl
            class="w-full md:mt-4"
            value={viewType}
            onChange={changeView}
            segmentClass="h-10"
            segments={ANALYTICS_SEGMENTED_ITEMS}
    />
</div>

<div class="md:w-3/4 mx-auto md:mt-8 md:px-0 px-2 pb-20 main-content">
    <RendererComponent/>
</div>

