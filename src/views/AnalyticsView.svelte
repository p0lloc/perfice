<script lang="ts">
    import {onMount} from "svelte";
    import {analytics} from "@perfice/main";
    import type {CorrelationResult} from "@perfice/services/analytics/analytics";
    import type {Form} from "@perfice/model/form/form";

    let res = $state<Map<string, CorrelationResult>>(new Map());
    let forms = $state<Form[]>([]);


    function convertSingleKey(key: string){
        if(key.startsWith("cat_")){
            key = key.substring(4);
        }

        if(key.startsWith("wd_")){
            return key.substring(3);
        }

        let parts = key.split(":");
        let form = forms.find(f => f.id == parts[0]);
        if(form == null) return "Unknown form";

        let question = form.questions.find(q => q.id == parts[1]);
        if(question == null) return "Unknown question";

        let base = `${form.name} > ${question.name}`;

        if(parts.length > 2){
            base += ` (${parts[2]})`;
        }

        return base;
    }

    function convertResultKey(key: string){
        let parts = key.split("|");
        let first = parts[0];
        let second = parts[1];

        return `${convertSingleKey(first)} | ${convertSingleKey(second)}`;
    }

    onMount(async () => {
        let [f, v] = await analytics.runBasicCorrelations(new Date(), 30, 1);
        forms = f;
        res = v;

        /*
        let [vals, formList] = await analytics.fetchAnalytics(SimpleTimeScopeType.DAILY, 7);

        forms = formList;
        res = vals;*/
    });
</script>

<div class="mx-auto w-1/2">
    {#each res.entries() as [key, value]}
        {#if value.coefficient >= 0.2}
            <div >
                <p class="font-bold">{convertResultKey(key)}: {value.coefficient}</p>
                <p>[{value.first.join(", ")}]</p>
                <p>[{value.second.join(", ")}]</p>
            </div>
        {/if}
    {/each}
    <!--
        {#each forms as form}
            <div class="mt-4">
                <h2 class="text-2xl">
                    {form.name}
                </h2>
                {#each form.questions as question}
                    <div>
                        <span class="text-xl">{question.name}</span>
                        {#each res.get(form.id)?.get(question.id)?.values ?? [] as [k, v]}
                            <div>
                                {#if typeof k == "number"}
                                    {formatDateYYYYMMDD(new Date(k))}
                                    {v.value} / {v.count}
                                {:else}
                                    {k}
                                    {#each v.entries() as [timestamp, freq]}
                                        <p>                                    {formatDateYYYYMMDD(new Date(timestamp))}
                                            : {freq}
                                        </p>
                                    {/each}
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/each}
            </div>
        {/each}
    -->
</div>