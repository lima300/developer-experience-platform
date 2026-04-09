import { dxpPreset } from '@dxp/ui/tailwind';

import type { Config } from 'tailwindcss';

export default {
  presets: [dxpPreset],
  content: ['./src/**/*.{ts,tsx}', './public/index.html'],
} satisfies Config;
