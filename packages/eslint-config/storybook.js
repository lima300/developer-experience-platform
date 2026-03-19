import storybookPlugin from 'eslint-plugin-storybook';

import { react } from './react.js';

/** @type {import("typescript-eslint").Config} */
export const storybook = [
  ...react,
  // Apply Storybook rules only to story files
  {
    files: ['**/*.stories.{ts,tsx}', '**/*.story.{ts,tsx}'],
    plugins: {
      storybook: storybookPlugin,
    },
    rules: {
      // Storybook-specific rules
      'storybook/await-interactions': 'error',
      'storybook/context-in-play-function': 'error',
      'storybook/default-exports': 'error',
      'storybook/no-redundant-story-name': 'warn',
      'storybook/prefer-pascal-case': 'warn',
      'storybook/story-exports': 'error',
      'storybook/use-storybook-expect': 'error',
      'storybook/use-storybook-testing-library': 'error',
    },
  },
  {
    // Storybook config files
    files: ['.storybook/**/*.{ts,tsx,js}'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
];
