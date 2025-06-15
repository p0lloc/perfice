import ky, {type KyInstance, type KyRequest, type KyResponse, type NormalizedOptions} from "ky";
import {parseJsonFromLocalStorage} from "@perfice/util/local";

const REMOTE_URLS_KEY = "remote_urls";
const ENABLED_REMOTES_KEY = "enabled_remotes";

export enum RemoteType {
    SYNC = "SYNC",
    AUTH = "AUTH",
    INTEGRATION = "INTEGRATION"
}

export const REMOTE_NAMES: Record<RemoteType, string> = {
    [RemoteType.SYNC]: "Sync",
    [RemoteType.AUTH]: "Account",
    [RemoteType.INTEGRATION]: "Integrations"
};

export class RemoteService {

    private enabledRemotes: RemoteType[] = [];
    private readonly urls: Record<RemoteType, string>;
    private clients: Map<RemoteType, KyInstance> = new Map();

    private remoteEnableCallbacks: Map<RemoteType, (() => void)[]> = new Map();
    private remoteDisableCallbacks: Map<RemoteType, (() => void)[]> = new Map();

    private refreshCallback: (() => Promise<boolean>) | null = null;

    constructor() {
        this.enabledRemotes = parseJsonFromLocalStorage<RemoteType[]>(ENABLED_REMOTES_KEY) ?? [];
        let remotes = parseJsonFromLocalStorage<Record<RemoteType, string>>(REMOTE_URLS_KEY);

        this.urls = {} as Record<RemoteType, string>;
        Object.values(RemoteType).forEach(type => {
            let url = remotes?.[type];
            this.urls[type] = url ?? "";
        });

        for (let enabledRemote of [...this.enabledRemotes, RemoteType.AUTH]) {
            this.clients.set(enabledRemote, this.createClient(enabledRemote, this.urls[enabledRemote]));
        }
    }

    private transformUrl(url: string | undefined): string {
        return url != null && url.length > 0 ? url : import.meta.env.VITE_BACKEND_URL;
    }

    setRefreshCallback(callback: (() => Promise<boolean>) | null) {
        this.refreshCallback = callback;
    }

    getRemoteUrl(type: RemoteType): string {
        return this.urls[type];
    }

    setRemoteUrl(type: RemoteType, url: string) {
        this.urls[type] = url;
        this.clients.set(type, this.createClient(type, url));
        localStorage.setItem(REMOTE_URLS_KEY, JSON.stringify(this.urls));
        this.remoteEnableCallbacks.get(type)?.forEach(callback => callback());
    }

    setRemoteEnabled(type: RemoteType, enabled: boolean) {
        if (enabled) {
            this.enabledRemotes.push(type);
            this.clients.set(type, this.createClient(type, this.urls[type]));
            this.remoteEnableCallbacks.get(type)?.forEach(callback => callback());
        } else {
            this.enabledRemotes = this.enabledRemotes.filter(t => t != type);
            this.clients.delete(type);
            this.remoteDisableCallbacks.get(type)?.forEach(callback => callback());
        }

        localStorage.setItem(ENABLED_REMOTES_KEY, JSON.stringify(this.enabledRemotes));
    }

    addRemoteEnableCallback(type: RemoteType, callback: () => void) {
        let callbacks = this.remoteEnableCallbacks.get(type);
        if (callbacks == null) {
            callbacks = [];
            this.remoteEnableCallbacks.set(type, callbacks);
        }

        callbacks.push(callback);
    }

    addRemoteDisableCallback(type: RemoteType, callback: () => void) {
        let callbacks = this.remoteDisableCallbacks.get(type);
        if (callbacks == null) {
            callbacks = [];
            this.remoteDisableCallbacks.set(type, callbacks);
        }

        callbacks.push(callback);
    }

    isRemoteEnabled(type: RemoteType): boolean {
        return this.enabledRemotes.includes(type);
    }

    getRemoteClient(type: RemoteType): KyInstance | undefined {
        return this.clients.get(type);
    }

    private createClient(type: RemoteType, url: string): KyInstance {
        url = this.transformUrl(url);
        switch (type) {
            case RemoteType.SYNC:
                return this.createSyncClient(url);
            case RemoteType.AUTH:
                return this.createAuthClient(url);
            case RemoteType.INTEGRATION:
                return this.createIntegrationClient(url);
        }
    }

    private async refreshHook(input: KyRequest, options: NormalizedOptions, response: KyResponse) {
        if (response.status != 401 || input.url.includes("login"))
            return response;

        let refresh = this.refreshCallback;
        if (refresh != null) {
            let refreshed = await refresh();
            if (!refreshed) {
                alert("Refresh failed");
                throw new Error("Refresh failed");
            }

            return ky(input, options);
        }
    }

    private createSyncClient(url: string): KyInstance {
        return ky.extend({
            prefixUrl: `${url}/api/sync`,
            timeout: 50000,
            retry: 0,
            throwHttpErrors: false,
            credentials: "include",
            hooks: {
                afterResponse: [
                    this.refreshHook.bind(this)
                ]
            }
        });
    }

    private createAuthClient(url: string): KyInstance {
        return ky.extend({
            prefixUrl: `${url}/auth`,
            timeout: 2000,
            credentials: "include",
            retry: 0,
            throwHttpErrors: false,
            hooks: {
                afterResponse: [
                    this.refreshHook.bind(this)
                ]
            }
        });
    }

    private createIntegrationClient(url: string): KyInstance {
        return ky.extend({
            prefixUrl: `${url}/`,
            timeout: 2000,
            throwHttpErrors: false,
            credentials: "include",
            retry: 0,
            hooks: {
                afterResponse: [
                    this.refreshHook.bind(this)
                ]
            }
        });
    }

}