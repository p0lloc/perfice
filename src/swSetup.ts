export function setupServiceWorker() {
    if ("serviceWorker" in navigator) {
        let registration = navigator.serviceWorker
            .register(
                "/sw.js",
                // import.meta.env.MODE === "production"
                //     ? "/app/sw.js"
                //     : "/dev-sw.js?dev-sw",
                // {type: import.meta.env.MODE === 'production' ? 'classic' : 'module'},
            )
            .then((r) => {
            });
    }
}
