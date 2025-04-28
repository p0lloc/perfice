import {App as CapacitorApp} from '@capacitor/app';
import {setupDb} from "@perfice/db/dexie/db";
import {routingNavigatorState} from './model/ui/router.svelte.js';
import {goto} from '@mateothegreat/svelte5-router';
import {Capacitor} from '@capacitor/core';
import {closableState} from './model/ui/modal';
import {LocalNotifications} from "@capacitor/local-notifications";
import {registerDataTypes} from "@perfice/model/form/data";
import {appReady, onboarding, reflections, setupStores, variables} from "@perfice/stores";
import {setupServices} from "@perfice/services";
import {setupServiceWorker} from './swSetup.js';
import {MigrationService} from "@perfice/db/migration/migration";

// Main entry point of the application
(async () => {
    let {collections, migrator} = setupDb();
    const migrationService = new MigrationService(migrator);
    await migrationService.migrate();

    let services = setupServices(collections);
    await setupStores(services);
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
            goto(previousRoute);
            return;
        }
    }

    // Exit app on mobile and go to root route on web
    if (Capacitor.getPlatform() != "web") {
        await CapacitorApp.exitApp();
    } else {
        goto("/");
    }
}

CapacitorApp.addListener("backButton", back);
