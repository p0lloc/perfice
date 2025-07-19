import ky, {type KyInstance} from "ky";

export class FeedbackStore {
    private httpClient: KyInstance;

    constructor() {
        this.httpClient = ky.extend({
            prefixUrl: import.meta.env.VITE_BACKEND_URL
        })
    }

    async sendFeedback(feedback: string): Promise<boolean> {
        return (await this.httpClient.post("feedback", {
            body: feedback
        })).ok;
    }

}