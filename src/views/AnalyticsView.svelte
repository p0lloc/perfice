<script>
    import SegmentedControl from "@perfice/components/base/segmented/SegmentedControl.svelte";
    import Title from "@perfice/components/base/title/Title.svelte";
    import {faChartLine} from "@fortawesome/free-solid-svg-icons";
</script>

<div class="md:w-1/2 mx-auto md:mt-8 md:p-0 p-2 main-content">
    <Title title="Analytics" icon={faChartLine}/>
    <SegmentedControl class="w-full" value="t" segments={[{"name": "Trackables", "value": "t"}, {"name": "Tags", "value": "ta"}, {"name": "Correlations", "value": "c"}]} />
</div>
