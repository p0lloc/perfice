// Bundler entry for the local Capacitor plugin when `android/dist/` has not been built.
import { registerPlugin } from '@capacitor/core';

import type { PerficePlugin } from '../../../android/src/definitions';

export const Perfice = registerPlugin<PerficePlugin>('Perfice', {});

export type {
    NativeIntegration,
    NativeIntegrationUpdate,
    PerficePlugin,
} from '../../../android/src/definitions';
