![Perfice - Screenshot](https://raw.githubusercontent.com/p0lloc/perfice/main/client/assets/screenshot.png)
# Perfice - Open self-tracking platform

Perfice is an open-source self-tracking platform that helps you track anything you like, and see how different metrics impact other areas of your life. It is built to be heavily customizable and local-first, leaving you in control of your tracking journey.


## Key Features
- **Trackables**: Easily track anything you like - sleep, mood, or food
- **Correlations**: Automatic insights like "Mood is better when you sleep longer"
- **Goals**: Set goals to stay motivated, supports multiple trackables
- **Privacy first**: Data is stored and calculated locally on your device
- **Exportability**: All data can be exported to/from CSV and JSON
## Quick Start
### Install project dependencies
```bash
npm install
```

### Running the project
```bash
npm run dev
```

### Building the project for production
```bash
npm run build
```
### Running with Docker
A basic Dockerfile is provided for building the app with Node and spinning up an nginx server.
Note that the app runs under the `/new` subpath.

## Stack
Perfice is built with Svelte 5, TypeScript, TailwindCSS and leverages IndexedDB for most data storage.    
It uses [Capacitor](https://github.com/ionic-team/capacitor) to wrap the webapp in a native WebView application for Android.

### Running the Android app
```bash
CAPACITOR=true npm run build && npx cap run android
```

## Backend
User accounts, synchronization and integrations require a backend to function. You can set the service URL locally by clicking the globe (🌐) icon on the settings page. 
To set a default backend URL, configure the `VITE_BACKEND_URL` environment variable in a `.env` or `.env.development` file in the root of the project.

The backend is currently not open source and the protocol documentation is sadly not yet finished. However, most functionality can be deduced (for the brave) from the [code](https://github.com/p0lloc/perfice/blob/main/src/services) in the auth, integration and sync modules.

## License
Perfice is licensed under the [MIT license](https://github.com/p0lloc/perfice/blob/main/LICENSE).

## Contributing
Contributions are always appreciated and welcome! Please open an issue or pull request if you have any suggestions or find a bug.
