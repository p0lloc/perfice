import {derived, type Readable} from "svelte/store";
import type {HistoricalQuantitativeInsight} from "@perfice/services/analytics/analytics";
import type {DashboardInsightsWidgetSettings} from "@perfice/model/dashboard/widgets/insights";
import {getInsightText, type InsightText} from "@perfice/services/analytics/display";
import {analytics, forms} from "@perfice/stores";

export interface InsightResult {
    formName: string;
    questionName: string;
    text: InsightText;
    icon: string;
    insight: HistoricalQuantitativeInsight;
}

export interface InsightsWidgetResult {
    insights: InsightResult[];
}

export function InsightsWidget(settings: DashboardInsightsWidgetSettings, date: Date): Readable<Promise<InsightsWidgetResult>> {
    return derived(analytics, (value, set) => {
        set(new Promise(async (resolve) => {
            let result = await value;

            let insights = await analytics.findHistoricalQuantitativeInsights(result, settings.timeScope, date);
            let converted = [];
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
            }

            resolve({
                insights: converted.sort((a, b) => b.insight.error - a.insight.error)
            });
        }));
    });
}