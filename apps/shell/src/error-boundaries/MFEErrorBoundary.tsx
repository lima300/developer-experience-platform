import { captureError } from '@dxp/observability';
import { ErrorFallback } from '@dxp/ui';
import { Component, type ErrorInfo, type ReactNode } from 'react';

import type { MFEManifest } from '@dxp/federation-contracts';

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

interface Props {
  manifest: MFEManifest;
  children: ReactNode;
}

const MAX_RETRIES = 2;

export class MFEErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, retryCount: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureError(error, this.props.manifest.name);
    console.error(`[MFE Error] ${this.props.manifest.name}:`, error, info.componentStack);
  }

  retry = () => {
    // Remove the previously injected script so loadRemote re-injects on the next render
    document.querySelector(`script[data-mfe="${this.props.manifest.scope}"]`)?.remove();

    this.setState((s) => ({
      hasError: false,
      error: null,
      retryCount: s.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center p-8">
          <div className="max-w-md w-full">
            <ErrorFallback
              error={this.state.error}
              mfeName={this.props.manifest.name}
              {...(this.state.retryCount < MAX_RETRIES && { onRetry: this.retry })}
            />
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
