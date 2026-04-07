// Dynamic import REQUIRED for Module Federation.
// Deferring bootstrap until after the federation container.init() call
// ensures shared singletons (React, etc.) are resolved before any module runs.
// See: https://webpack.js.org/concepts/module-federation/#troubleshooting
import('./bootstrap');
