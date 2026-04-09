import { dxpPreset } from '@dxp/ui/tailwind';

import type { Config } from 'tailwindcss';

// MFEs must extend the DXP preset — never define standalone Tailwind tokens.
export default {
  presets: [dxpPreset],
  content: ['./src/**/*.{ts,tsx}'],
} satisfies Config;
