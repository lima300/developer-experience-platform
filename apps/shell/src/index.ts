// The ONLY webpack entry point.
// The async import triggers Module Federation shared scope initialization
// before any shared singletons (React, etc.) are loaded.
import('./bootstrap');
