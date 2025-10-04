import type {AuthenticatedUser} from "@perfice/model/auth/auth";
import {CustomStore} from "@perfice/stores/store";
import {type AuthService, LoginResult} from "@perfice/services/auth/auth";

export class AuthStore extends CustomStore<AuthenticatedUser | null> {

    private readonly authService: AuthService;

    constructor(authService: AuthService) {
        super(authService.getUser());
        this.authService = authService;
        this.authService.addAuthStatusCallback(async (user: AuthenticatedUser | null) => {
            this.set(user);
        });
    }

    async login(email: string, password: string): Promise<LoginResult> {
        return await this.authService.login(email, password);
    }

    async resetPassword(email: string) {
        return await this.authService.resetPassword(email);
    }

    async resendConfirmationEmail(email: string) {
        return await this.authService.resendConfirmationEmail(email);
    }

    async logout() {
        await this.authService.logout();
    }

    async register(email: string, password: string) {
        return await this.authService.register(email, password);
    }

    async setTimezone(timezone: string) {
        return await this.authService.setTimezone(timezone);
    }

    async deleteAccount() {
        return await this.authService.deleteAccount();
    }

}