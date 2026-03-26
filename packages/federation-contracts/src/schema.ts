import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export const AuthContextSchema = z.object({
  user: UserSchema,
  roles: z.array(z.string()),
  token: z.string(),
  logout: z.function(),
});

export const RouterContextSchema = z.object({
  basePath: z.string(),
});

export const ThemeContextSchema = z.object({
  mode: z.enum(['light', 'dark']),
});

export const MFEPropsSchema = z.object({
  auth: AuthContextSchema,
  router: RouterContextSchema,
  theme: ThemeContextSchema,
});

export const MFEManifestSchema = z.object({
  name: z.string().min(1),
  route: z.string().startsWith('/'),
  scope: z.string().min(1),
  module: z.string().startsWith('./'),
  url: z.string().url(),
  permissions: z.array(z.string()),
  enabled: z.boolean(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Must be a valid semver string'),
  canaryPercent: z.number().int().min(0).max(100),
});

export const RegistrySchema = z.object({
  mfes: z.array(MFEManifestSchema),
});

/**
 * Runtime validator for the factory function returned by a loaded MFE remote.
 * Used in loadRemote.ts after injecting the remote script.
 */
export const MFEMountFnSchema = z.function(
  z.tuple([
    z.custom<HTMLElement>((v) => v instanceof HTMLElement, 'Must be an HTMLElement'),
    MFEPropsSchema,
  ]),
  z.custom<{ unmount: () => void }>(),
);
