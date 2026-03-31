import { initSentry } from '@dxp/observability';
import { createRoot } from 'react-dom/client';

import { App } from './App.js';
import { SENTRY_DSN, APP_ENV, APP_VERSION } from './constants.js';
import './styles/globals.css';

// Initialize Sentry before rendering — shell owns this, MFEs must never call initSentry()
initSentry({ dsn: SENTRY_DSN, environment: APP_ENV, release: APP_VERSION });

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found in index.html');

createRoot(rootEl).render(<App />);
