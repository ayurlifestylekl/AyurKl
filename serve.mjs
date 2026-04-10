#!/usr/bin/env node
// Static file server for one-off HTML prototypes.
// Serves the current working directory on http://localhost:3000.
//
// Usage:
//   node serve.mjs                # serves cwd
//   PORT=4000 node serve.mjs      # override port

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const PORT = Number(process.env.PORT ?? 3000);
const ROOT = resolve(process.cwd());

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

async function serveFile(filePath, res) {
  const ext = extname(filePath).toLowerCase();
  const mime = MIME[ext] ?? 'application/octet-stream';
  const data = await readFile(filePath);
  res.writeHead(200, {
    'Content-Type': mime,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  });
  res.end(data);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';

    // Resolve and confine to ROOT (prevent directory traversal)
    const filePath = resolve(ROOT, '.' + pathname);
    if (filePath !== ROOT && !filePath.startsWith(ROOT + '/')) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    let target = filePath;
    const fileStat = await stat(target).catch(() => null);

    if (!fileStat) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found: ' + req.url);
      return;
    }

    if (fileStat.isDirectory()) {
      target = join(filePath, 'index.html');
      const indexStat = await stat(target).catch(() => null);
      if (!indexStat || !indexStat.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('No index.html in directory: ' + req.url);
        return;
      }
    }

    await serveFile(target, res);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server Error: ' + err.message);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\u2717 Port ${PORT} is already in use.`);
    console.error(`  An existing serve.mjs may already be running. Use it,`);
    console.error(`  or free the port: lsof -ti:${PORT} | xargs kill -9`);
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`\u2192 Serving ${ROOT}`);
  console.log(`  http://localhost:${PORT}`);
});
