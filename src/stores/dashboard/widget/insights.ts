import {derived, type Readable} from "svelte/store";
import type {HistoricalQuantitativeInsight} from "@perfice/services/analytics/analytics";
import type {DashboardInsightsWidgetSettings} from "@perfice/model/dashboard/widgets/insights";
import {getInsightText, type InsightText} from "@perfice/services/analytics/display";
import {analytics, forms} from "@perfice/stores";
import {FormQuestionDataType} from "@perfice/model/form/form";

export interface InsightResult {
    formName: string;
    questionName: string;
    text: InsightText;
    icon: string;
    insight: HistoricalQuantitativeInsight;
}

export interface InsightsWidgetResult {
    insights: InsightResult[];
    empty: boolean;
}

export const DUMMY_INSIGHTS: InsightResult[] = [
    {
        form: "Mood",
        question: "Feeling",
        icon: "😄",
        current: 4,
        average: 2.8,
        type: FormQuestionDataType.NUMBER,
    },
    {
        form: "Sleep",
        question: "Duration",
        icon: "🛏️",
        current: 530,
        average: 410,
        type: FormQuestionDataType.TIME_ELAPSED,
    },

    {
        form: "Steps",
        question: "Steps",
        icon: "🥾",
        current: 3300,
        average: 7210,
        type: FormQuestionDataType.NUMBER,
    }
].map(i => {
    let data: HistoricalQuantitativeInsight = {
        formId: "",
        questionId: "",
        current: i.current,
        average: i.average,
        ratio: i.current / i.average,
        diff: Math.abs(i.current / i.average - 1),
    }
    return ({
        formName: i.form,
        questionName: i.question,
        icon: i.icon,
        text: getInsightText(data, i.type),
        insight: data
    });
});

export function InsightsWidget(settings: DashboardInsightsWidgetSettings, date: Date): Readable<Promise<InsightsWidgetResult>> {
    return derived(analytics, (value, set) => {
        set(new Promise(async (resolve) => {
            let result = await value;

            let insights = await analytics.findHistoricalQuantitativeInsights(result, settings.timeScope, date);
            let converted = [];

            let empty = true;
            for (let insight of insights) {
                let form = await forms.getFormById(insight.formId);
                if (form == null) continue;

                let question = form.questions.find(q => q.id == insight.questionId);
                if (question == null) continue;

                converted.push({
                    formName: form.name,
                    questionName: question.name,
                    icon: form.icon,
                    text: getInsightText(insight, question.dataType),
                    insight
                });
                empty = false;
            }

            if (converted.length == 0) {
                converted = DUMMY_INSIGHTS;
            }

            resolve({
                insights: converted.sort((a, b) => Math.abs(b.insight.diff) - Math.abs(a.insight.diff)),
                empty,
            });
        }));
    });
}