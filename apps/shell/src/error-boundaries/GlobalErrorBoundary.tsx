import { captureError } from '@dxp/observability';
import { ErrorFallback } from '@dxp/ui';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  children: ReactNode;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureError(error, 'shell');
    console.error('[Shell] Unhandled error in React tree:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-dxp-surface p-8">
          <div className="max-w-md w-full">
            <ErrorFallback error={this.state.error} mfeName="shell" onRetry={this.handleReload} />
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
