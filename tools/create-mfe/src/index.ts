import process from 'node:process';

import { scaffoldMFE } from './scaffold.js';

function parseArgs(): { name: string; port: number } {
  const args = process.argv.slice(2);

  const name = args.find((a) => !a.startsWith('--'));
  const portFlag = args.findIndex((a) => a === '--port');
  const portArg = portFlag !== -1 ? args[portFlag + 1] : undefined;

  if (!name) {
    console.error('Usage: pnpm create-mfe <name> --port <port>');
    console.error('Example: pnpm create-mfe feature-flags --port 3001');
    process.exit(1);
  }

  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    console.error(`Invalid name "${name}": must be lowercase letters, numbers, and hyphens only.`);
    process.exit(1);
  }

  const port = portArg !== undefined ? parseInt(portArg, 10) : NaN;
  if (isNaN(port) || port < 1024 || port > 65535) {
    console.error('--port must be an integer between 1024 and 65535.');
    process.exit(1);
  }

  return { name, port };
}

const { name, port } = parseArgs();
scaffoldMFE({ name, port });
