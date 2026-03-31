import type { MFEManifest } from '@dxp/federation-contracts';

export class FederationLoadError extends Error {
  constructor(
    message: string,
    public readonly manifest: MFEManifest,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'FederationLoadError';
  }
}

export class FederationTimeoutError extends FederationLoadError {
  constructor(manifest: MFEManifest) {
    super(`MFE "${manifest.name}" timed out after 10 seconds`, manifest);
    this.name = 'FederationTimeoutError';
  }
}

export class FederationMountError extends FederationLoadError {
  constructor(manifest: MFEManifest, cause: unknown) {
    super(`MFE "${manifest.name}" mount() threw an error`, manifest, cause);
    this.name = 'FederationMountError';
  }
}
