import { createReadStream, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const EXAMPLES_DIR = join(__dirname, '..', '..', 'examples');

export function examplesMiddlewarePlugin(): Plugin {
  return {
    name: 'examples-middleware',
    configureServer(server) {
      server.middlewares.use('/__examples__', (req, res, next) => {
        const filePath = join(EXAMPLES_DIR, req.url ?? '/');

        try {
          statSync(filePath);
        } catch {
          next();
          return;
        }

        res.writeHead(200, {
          'Content-Type': 'application/octet-stream',
          'Access-Control-Allow-Origin': '*',
        });

        createReadStream(filePath).pipe(res);
      });
    },
  };
}
