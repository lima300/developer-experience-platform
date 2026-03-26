import type { Config } from 'tailwindcss';

/**
 * DXP Tailwind preset.
 * All MFE apps MUST extend this preset — never create a standalone tailwind.config.ts in an MFE.
 *
 * Usage in an MFE's tailwind.config.ts:
 *   import { dxpPreset } from '@dxp/ui/tailwind';
 *   export default { presets: [dxpPreset], content: [...] }
 */
export const dxpPreset = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dxp-primary': 'var(--dxp-primary)',
        'dxp-primary-foreground': 'var(--dxp-primary-foreground)',
        'dxp-surface': 'var(--dxp-surface)',
        'dxp-surface-elevated': 'var(--dxp-surface-elevated)',
        'dxp-muted': 'var(--dxp-muted)',
        'dxp-muted-foreground': 'var(--dxp-muted-foreground)',
        'dxp-border': 'var(--dxp-border)',
        'dxp-accent': 'var(--dxp-accent)',
        'dxp-accent-foreground': 'var(--dxp-accent-foreground)',
        'dxp-destructive': 'var(--dxp-destructive)',
        'dxp-success': 'var(--dxp-success)',
        'dxp-warning': 'var(--dxp-warning)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        dxp: '6px',
      },
    },
  },
} satisfies Omit<Config, 'content'>;
