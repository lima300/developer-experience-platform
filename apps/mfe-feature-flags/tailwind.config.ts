import { dxpPreset } from '@dxp/ui/tailwind';

import type { Config } from 'tailwindcss';

// MFEs must extend the DXP preset — never define standalone Tailwind tokens.
// This ensures design system CSS variables resolve correctly inside the shell.
export default {
  presets: [dxpPreset],
  content: ['./src/**/*.{ts,tsx}'],
} satisfies Config;
