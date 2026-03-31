import { dxpPreset } from '@dxp/ui/tailwind';

import type { Config } from 'tailwindcss';

const config: Config = {
  presets: [dxpPreset as Config],
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
};

export default config;
