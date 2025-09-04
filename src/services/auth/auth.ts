import {type KyInstance, type KyRequest, type KyResponse, type Options} from "ky";
import type {AuthenticatedUser} from "@perfice/model/auth/auth";
import {type RemoteService, RemoteType} from "@perfice/services/remote/remote";
import {clearSecureStorage, getItemFromSecureStorage, setItemInSecureStorage} from "capacitor-secure-storage";

export type AuthStatusChangeCallback = (user: AuthenticatedUser | null) => Promise<void>;

export interface SessionResponse {
    accessToken: string;
    refreshToken: string;
}

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export enum LoginResult {
    SUCCESS,
    INVALID_CREDENTIALS,
    UNCONFIRMED_EMAIL,
}

export class AuthService {

    private authStatusChangeCallbacks: AuthStatusChangeCallback[] = [];
    private loginCallbacks: (() => void)[] = [];
    private remoteService: RemoteService;

    private user: AuthenticatedUser | null = null;

    private accessToken: string | null = null;
    private refreshToken: string | null = null;

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

        this.accessToken = await getItemFromSecureStorage(ACCESS_TOKEN_KEY);
        this.refreshToken = await getItemFromSecureStorage(REFRESH_TOKEN_KEY);
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

    async login(email: string, password: string): Promise<LoginResult> {
        let response = await this.getClient().post("login", {
            json: {
                email,
                password
            }
        });

        switch (response.status) {
            case 401:
                return LoginResult.INVALID_CREDENTIALS;
            case 403:
                return LoginResult.UNCONFIRMED_EMAIL;
        }

        if (!await this.handleSessionResponse(response)) {
            await this.setUser(null);
            return LoginResult.INVALID_CREDENTIALS;
        }

        await this.checkAuth();

        let authenticated = this.isAuthenticated();
        if (authenticated) {
            this.loginCallbacks.forEach(callback => callback());
        }

        return authenticated ? LoginResult.SUCCESS : LoginResult.INVALID_CREDENTIALS;
    }

    private async handleSessionResponse(response: KyResponse): Promise<boolean> {
        if (!response.ok) {
            return false;
        }

        // We cannot use Secure + HttpOnly cookies because Chrome has started phasing out third-party cookies
        // Which is necessary since the backend server is hosted on a different domain.
        // This leads to access/refresh tokens not being always set, creating unpredictable behaviour.
        let json = await response.json<SessionResponse>();
        this.accessToken = json.accessToken;
        this.refreshToken = json.refreshToken;
        await setItemInSecureStorage(ACCESS_TOKEN_KEY, json.accessToken);
        await setItemInSecureStorage(REFRESH_TOKEN_KEY, json.refreshToken);
        return true;
    }

    async logout() {
        let response = await this.postAuthenticated("logout");

        if (!response.ok) return false;

        await clearSecureStorage();
        this.accessToken = null;
        this.refreshToken = null;
        await this.checkAuth();
        return true;
    }

    accessTokenHook(request: KyRequest) {
        request.headers.set("Authorization", `Bearer ${this.accessToken}`);
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
        let response = await this.getClient().post("refresh", {
            json: {
                accessToken: this.accessToken,
                refreshToken: this.refreshToken
            }
        });

        if (!await this.handleSessionResponse(response)) {
            await this.setUser(null);
            return false;
        }

        return true;
    }

    async checkAuth() {
        if (this.accessToken == null || this.refreshToken == null) {
            await this.setUser(null);
            return;
        }

        try {
            let response = await this.getAuthenticated("me");
            if (!response.ok) {
                await this.setUser(null);
                return;
            }

            let user = await response.json<AuthenticatedUser>();
            await this.setUser(user);
        } catch (e) {
            console.error(e);
            await this.setUser(null);
        }
    }

    private async setUser(user: AuthenticatedUser | null) {
        this.user = user;
        for (let callback of this.authStatusChangeCallbacks) {
            await callback(user);
        }
    }

    async setTimezone(timezone: string): Promise<boolean> {
        let res = await this.getClient().put("timezone", this.getAuthenticatedOptions({
            json: {
                timezone
            }
        }));

        if (!res.ok || !this.user)
            return false;

        this.user.timezone = timezone;
        return true;
    }

    async deleteAccount() {
        let res = await this.postAuthenticated("delete");
        return res.ok;
    }

    async resetPassword(email: string) {
        let res = await this.getClient().post("resetInit", {
            searchParams: {
                email
            }
        });

        return res.ok;
    }

    addLoginCallback(callback: () => void) {
        this.loginCallbacks.push(callback);
    }

    private async getAuthenticated(endpoint: string, options: Options = {}) {
        return this.getClient().get(endpoint, this.getAuthenticatedOptions(options));
    }

    private async postAuthenticated(endpoint: string, options: Options = {}) {
        return this.getClient().post(endpoint, this.getAuthenticatedOptions(options));
    }

    private getAuthenticatedOptions(options: Options = {}) {
        return {
            hooks: {
                beforeRequest: [this.accessTokenHook.bind(this)]
            },
            ...options
        };
    }
}