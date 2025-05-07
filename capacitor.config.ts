import type {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'io.perfice.app',
    appName: 'Perfice',
    webDir: 'dist',
    plugins: {
        LocalNotifications: {
            smallIcon: "res://drawable/small_icon",
            largeIcon: "res://drawable/splash",
            iconColor: "#16A34A"
        }
    }
};

export default config;
