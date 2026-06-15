import type { Config } from 'tailwindcss';

/**
 * DXP Tailwind preset.
 * All MFE apps MUST extend this preset — never create a standalone tailwind.config.ts in an MFE.
 *
 * Color tokens are defined as raw HSL channels in `@dxp/ui/tokens.css` and consumed here as
 * `hsl(var(--token) / <alpha-value>)`, so Tailwind opacity modifiers (e.g. `bg-dxp-primary/10`)
 * work correctly. Import the token CSS once per app:
 *   @import '@dxp/ui/tokens.css';
 *
 * Usage in an MFE's tailwind.config.ts:
 *   import { dxpPreset } from '@dxp/ui/tailwind';
 *   export default { presets: [dxpPreset], content: [...] }
 */

/** Wraps a CSS variable holding raw HSL channels so Tailwind can inject `<alpha-value>`. */
const hslVar = (name: string) => `hsl(var(${name}) / <alpha-value>)`;

export const dxpPreset = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dxp-primary': hslVar('--dxp-primary'),
        'dxp-primary-foreground': hslVar('--dxp-primary-foreground'),
        'dxp-foreground': hslVar('--dxp-foreground'),
        'dxp-background': hslVar('--dxp-background'),
        'dxp-surface': hslVar('--dxp-surface'),
        'dxp-surface-elevated': hslVar('--dxp-surface-elevated'),
        'dxp-muted': hslVar('--dxp-muted'),
        'dxp-muted-foreground': hslVar('--dxp-muted-foreground'),
        'dxp-border': hslVar('--dxp-border'),
        'dxp-accent': hslVar('--dxp-accent'),
        'dxp-accent-foreground': hslVar('--dxp-accent-foreground'),
        'dxp-destructive': hslVar('--dxp-destructive'),
        'dxp-success': hslVar('--dxp-success'),
        'dxp-warning': hslVar('--dxp-warning'),
        'dxp-rail': hslVar('--dxp-rail'),
        'dxp-topbar': hslVar('--dxp-topbar'),
        'dxp-topbar-foreground': hslVar('--dxp-topbar-foreground'),
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
