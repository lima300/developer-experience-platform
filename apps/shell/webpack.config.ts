import path from 'path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { container, DefinePlugin, type Configuration } from 'webpack';

import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';

const { ModuleFederationPlugin } = container;

const config = (
  _env: Record<string, string>,
  argv: { mode: string },
): Configuration & { devServer?: DevServerConfiguration } => {
  const isDev = argv.mode === 'development';

  return {
    entry: './src/index.ts',
    mode: isDev ? 'development' : 'production',

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isDev ? '[name].js' : '[name].[contenthash:8].js',
      chunkFilename: isDev ? '[name].chunk.js' : '[name].[contenthash:8].chunk.js',
      publicPath: 'auto',
      clean: true,
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      // Map .js imports to .ts/.tsx — required for TypeScript ESM-style imports
      extensionAlias: {
        '.js': ['.ts', '.tsx', '.js'],
        '.jsx': ['.tsx', '.jsx'],
      },
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
              transpileOnly: true, // type-check runs separately via tsc --noEmit
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
          ],
        },
      ],
    },

    plugins: [
      new ModuleFederationPlugin({
        name: 'shell',
        // Intentionally empty — all remotes loaded dynamically at runtime via loadRemote.ts
        remotes: {},
        shared: {
          react: { singleton: true, requiredVersion: '^18.0.0', eager: true },
          'react-dom': { singleton: true, requiredVersion: '^18.0.0', eager: true },
          'react-router-dom': { singleton: true, requiredVersion: '^6.0.0', eager: false },
          '@tanstack/react-query': {
            singleton: true,
            requiredVersion: '^5.0.0',
            eager: false,
          },
          '@dxp/auth-context': { singleton: true, requiredVersion: '*', eager: false },
          '@dxp/ui': { singleton: true, requiredVersion: '*', eager: false },
          '@dxp/federation-contracts': {
            singleton: true,
            requiredVersion: '*',
            eager: false,
          },
        },
      }),

      new HtmlWebpackPlugin({
        template: './public/index.html',
        title: 'Developer Experience Platform',
      }),

      new DefinePlugin({
        __DEV__: JSON.stringify(isDev),
        'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
        'process.env.REGISTRY_URL': JSON.stringify(
          process.env['REGISTRY_URL'] ?? 'http://localhost:4000/registry.json',
        ),
        'process.env.SENTRY_DSN': JSON.stringify(process.env['SENTRY_DSN'] ?? ''),
        'process.env.APP_ENV': JSON.stringify(process.env['APP_ENV'] ?? 'development'),
        'process.env.APP_VERSION': JSON.stringify(process.env['APP_VERSION'] ?? '0.0.0'),
      }),

      ...(!isDev ? [new MiniCssExtractPlugin({ filename: '[name].[contenthash:8].css' })] : []),
    ],

    ...(isDev && {
      devServer: {
        port: 3000,
        hot: true,
        historyApiFallback: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
        open: false,
      },
    }),

    ...(!isDev && {
      optimization: {
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: Infinity,
          minSize: 0,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: (module: { context?: string | null }) => {
                const match = module.context?.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                const packageName = match?.[1] ?? 'vendor';
                return `npm.${packageName.replace('@', '')}`;
              },
            },
          },
        },
      },
    }),

    devtool: isDev ? 'eval-source-map' : 'source-map',
  };
};

export default config;
