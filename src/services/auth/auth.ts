import {type KyInstance} from "ky";
import type {AuthenticatedUser} from "@perfice/model/auth/auth";
import {type RemoteService, RemoteType} from "@perfice/services/remote/remote";

export type AuthStatusChangeCallback = (user: AuthenticatedUser | null) => Promise<void>;

export class AuthService {

    private authStatusChangeCallbacks: AuthStatusChangeCallback[] = [];
    private remoteService: RemoteService;

    private user: AuthenticatedUser | null = null;

    constructor(remoteService: RemoteService) {
        this.remoteService = remoteService;
        this.remoteService.setRefreshCallback(async () => await this.refresh());
        this.remoteService.addRemoteEnableCallback(RemoteType.AUTH, async () => {
            await this.load();
        });
    }

    async load() {
        if (!(this.remoteService.isRemoteEnabled(RemoteType.AUTH)))
            return;

        await this.checkAuth();
    }

    private getClient(): KyInstance {
        return this.remoteService.getRemoteClient(RemoteType.AUTH)!;
    }

    addAuthStatusCallback(callback: AuthStatusChangeCallback) {
        this.authStatusChangeCallbacks.push(callback);
    }

    getUser(): AuthenticatedUser | null {
        return this.user;
    }

    isAuthenticated(): boolean {
        return this.user != null;
    }

    async login(email: string, password: string) {
        let response = await this.getClient().post("login", {
            json: {
                email,
                password
            }
        });

        if (!response.ok) {
            return false;
        }

        await this.checkAuth();
        return this.isAuthenticated();
    }

    async logout() {
        let response = await this.getClient().post("logout");
        await this.checkAuth();
        return response.ok;
    }

    async register(email: string, password: string) {
        let response = await this.getClient().post("register", {
            json: {
                email,
                password
            }
        });

        return response.ok;
    }

    async refresh() {
        let response = await this.getClient().post("refresh");
        if (!response.ok) {
            await this.setUser(null);
            return false;
        }

        return true;
    }

    async checkAuth() {
        try {
            let response = await this.getClient().get("me");
            if (!response.ok) {
                await this.setUser(null);
                return;
            }

            let user = await response.json<AuthenticatedUser>();
            await this.setUser(user);
        } catch (e) {
            console.error(e);
            this.setUser(null);
        }
    }

    private async setUser(user: AuthenticatedUser | null) {
        this.user = user;
        for (let callback of this.authStatusChangeCallbacks) {
            await callback(user);
        }
    }

    async setTimezone(timezone: string): Promise<boolean> {
        let res = await this.getClient().put("timezone", {
            json: {
                timezone
            }
        });

        if (!res.ok || !this.user)
            return false;

        this.user.timezone = timezone;
        return true;
    }
}