import { registerPlugin } from '@capacitor/core';

import type { PerficePlugin } from './definitions';

const Perfice = registerPlugin<PerficePlugin>('Perfice', {
});

export * from './definitions';
export { Perfice };
