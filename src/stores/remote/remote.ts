import {type RemoteService, RemoteType} from "@perfice/services/remote/remote";

export class RemoteStore {
    private remoteService: RemoteService;

    constructor(remoteService: RemoteService) {
        this.remoteService = remoteService;
    }

    getRemoteUrl(type: RemoteType): string {
        return this.remoteService.getRemoteUrl(type);
    }

    setRemoteUrl(type: RemoteType, url: string) {
        this.remoteService.setRemoteUrl(type, url);
    }

    setRemoteEnabled(remoteType: RemoteType, checked: boolean) {
        this.remoteService.setRemoteEnabled(remoteType, checked);
    }

    isRemoteEnabled(remoteType: RemoteType) {
        return this.remoteService.isRemoteEnabled(remoteType);
    }
}