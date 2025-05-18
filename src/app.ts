import {App as CapacitorApp} from '@capacitor/app';
import {setupDb} from "@perfice/db/dexie/db";
import {routingNavigatorState} from './model/ui/router.svelte.js';
import {Capacitor} from '@capacitor/core';
import {closableState} from './model/ui/modal';
import {LocalNotifications} from "@capacitor/local-notifications";
import {registerDataTypes} from "@perfice/model/form/data";
import {appReady, onboarding, reflections, setupStores, variables} from "@perfice/stores";
import {setupServices} from "@perfice/services";
import {setupServiceWorker} from './swSetup.js';
import {MigrationService} from "@perfice/db/migration/migration";
import {loadStoredWeekStart} from "@perfice/stores/ui/weekStart";
import {goto} from "@mateothegreat/svelte5-router";

export const BASE_URL = (import.meta.env.PROD && !Capacitor.isNativePlatform()) ? "/new" : "";

// Main entry point of the application
(async () => {
    let {tables, collections, migrator} = setupDb();
    const migrationService = new MigrationService(migrator);
    await migrationService.migrate();

    const weekStart = loadStoredWeekStart();

    let services = setupServices(collections, tables, migrationService, weekStart);
    await setupStores(services, weekStart);
    registerDataTypes();
    await variables.get();
    setupServiceWorker();
    onboarding.onboardNewUser();
    appReady.set(true);
    await services.notification.scheduleStoredNotifications();
    onAppOpened();

    LocalNotifications.addListener('localNotificationActionPerformed', async (data) => {
        await services.notification.onNotificationClicked(data.notification.extra);
    });
})();

/**
 * Called when the app is opened, either on page load (web) or moved into foreground (mobile)
 */
function onAppOpened() {
    // Give precedence to any reflections opened by notifications
    setTimeout(() => reflections.onAppOpened(), 500);
}

CapacitorApp.addListener('appStateChange', ({isActive}) => {
    if (!isActive) return;

    onAppOpened();
});

export function navigate(route: string) {
    goto(BASE_URL + route);
}

/**
 * Goes to the previous route (or closes the opened modal).
 * Exits the app on mobile if there are no more routes in history.
 */
export async function back() {
    let closableClose = closableState.pop();
    if (closableClose != undefined) {
        closableClose();
        return true;
    }

    let currentRoute = routingNavigatorState.pop();
    if (currentRoute != null) {
        let previousRoute = routingNavigatorState.pop();
        if (previousRoute != null) {
            navigate(previousRoute);
            return;
        }
    }

    // Exit app on mobile and go to root route on web
    if (Capacitor.getPlatform() != "web") {
        await CapacitorApp.exitApp();
    } else {
        navigate("/");
    }
}

CapacitorApp.addListener("backButton", back);
