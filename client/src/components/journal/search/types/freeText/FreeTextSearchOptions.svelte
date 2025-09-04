<script lang="ts">
    import type {FreeTextSearch} from "@perfice/model/journal/search/freeText";

    let {options, onChange}: { options: FreeTextSearch, onChange: (options: FreeTextSearch) => void } = $props();
</script>

<div class="p-4">
    <textarea class="w-full" placeholder="Search"
              onchange={(e) => onChange({...options, search: e.currentTarget.value})}></textarea>
</div>