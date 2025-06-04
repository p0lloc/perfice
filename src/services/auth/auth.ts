import ky, {type KyInstance} from "ky";
import type {AuthenticatedUser} from "@perfice/model/auth/auth";

export class AuthService {

    private client: KyInstance;

    constructor() {
        this.client = ky.extend({
            prefixUrl: `${import.meta.env.VITE_BACKEND_URL}/auth`,
            retry: 0,
            timeout: 2000,
            credentials: "include"
        })
    }

    async login(email: string, password: string) {
        let response = await this.client.post("login", {
            json: {
                email,
                password
            }
        });

        return response.ok;
    }

    async register(email: string, password: string) {
        let response = await this.client.post("register", {
            json: {
                email,
                password
            }
        });

        return response.ok;
    }

    async refresh() {
        let response = await this.client.post("refresh");
        return response.ok;
    }

    async checkAuth() {
        let response = await this.client.get("me").json<AuthenticatedUser>();
    }

}