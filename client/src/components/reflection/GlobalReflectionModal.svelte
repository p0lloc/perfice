<script lang="ts">
    import {subscribeToEventStore} from "@perfice/util/event";
    import {openReflectionEvents} from "@perfice/model/reflection/ui";
    import ReflectionModal from "@perfice/components/reflection/modal/ReflectionModal.svelte";

    let reflectionModal: ReflectionModal;

    $effect(() => {
        subscribeToEventStore($openReflectionEvents, openReflectionEvents, (e) => reflectionModal.open(e));
    });
</script>

<ReflectionModal bind:this={reflectionModal}/>
