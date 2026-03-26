/**
 * Core domain types for the DXP federation contract.
 * Zero React dependency — any framework can implement this.
 */

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthContext {
  user: User;
  roles: string[];
  token: string;
  logout: () => void;
}

export interface RouterContext {
  basePath: string;
}

export interface ThemeContext {
  mode: 'light' | 'dark';
}

export interface MFEProps {
  auth: AuthContext;
  router: RouterContext;
  theme: ThemeContext;
}

export interface MFEInstance {
  unmount: () => void;
}

/**
 * The single contract every MFE remote must implement.
 * Exported as `./App` via the federation `exposes` config.
 */
export type MFEMountFn = (container: HTMLElement, props: MFEProps) => MFEInstance;

/**
 * Shape of a single MFE entry in registry.json.
 */
export interface MFEManifest {
  name: string;
  route: string;
  scope: string;
  module: string;
  url: string;
  permissions: string[];
  enabled: boolean;
  version: string;
  canaryPercent: number;
}

export interface Registry {
  mfes: MFEManifest[];
}
