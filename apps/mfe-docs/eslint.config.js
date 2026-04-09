import { react } from '@dxp/eslint-config/react';

export default [...react, { ignores: ['dist/**', 'node_modules/**', '.rsbuild/**'] }];
