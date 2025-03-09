<script lang="ts">
  import SegmentedControl from "@perfice/components/base/segmented/SegmentedControl.svelte";
  import Title from "@perfice/components/base/title/Title.svelte";
  import { faChartLine } from "@fortawesome/free-solid-svg-icons";
  import {
    ANALYTICS_SEGMENTED_ITEMS,
    AnalyticsViewType,
  } from "@perfice/model/analytics/ui";
  import AnalyticsTrackableView from "@perfice/components/analytics/AnalyticsTrackableView.svelte";
  import AnalyticsTagView from "@perfice/components/analytics/AnalyticsTagView.svelte";
  import AnalyticsCorrelationView from "@perfice/components/analytics/AnalyticsCorrelationView.svelte";
  import type { Component } from "svelte";
  import { analytics } from "@perfice/main";
  import type { AnalyticsResult } from "@perfice/stores/analytics/analytics";

  let viewType = $state(AnalyticsViewType.TRACKABLES);
  let result = $state(analytics.fetchAnalytics(new Date(), 10, 3));

  function changeView(value: AnalyticsViewType) {
    viewType = value;
  }

  const VIEWS: Record<
    AnalyticsViewType,
    Component<{ result: AnalyticsResult }>
  > = {
    [AnalyticsViewType.TRACKABLES]: AnalyticsTrackableView,
    [AnalyticsViewType.TAGS]: AnalyticsTagView,
    [AnalyticsViewType.CORRELATIONS]: AnalyticsCorrelationView,
  };

  let RendererComponent = $derived(VIEWS[viewType]);
</script>

<div class="md:w-1/2 mx-auto md:mt-8 md:p-0 p-2 main-content">
  <Title title="Analytics" icon={faChartLine} />
  <SegmentedControl
    class="w-full mt-4"
    value={viewType}
    onChange={changeView}
    segmentClass="h-10"
    segments={ANALYTICS_SEGMENTED_ITEMS}
  />
</div>

{#await result}
  Loading...
{:then value}
  <div class="md:w-3/4 mx-auto md:mt-8 md:p-0 p-2 main-content">
    <RendererComponent result={value} />
  </div>
{/await}

