import { cp, mkdir, readFile, readdir, rm, unlink, writeFile } from 'node:fs/promises';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const nextOutput = resolve(root, '.next');
const publicDir = resolve(root, 'public');
const distDir = resolve(root, 'dist');
const clientDir = resolve(distDir, 'client');
const serverDir = resolve(distDir, 'server');

await rm(distDir, { recursive: true, force: true });
await mkdir(resolve(clientDir, '_next'), { recursive: true });
await mkdir(serverDir, { recursive: true });

await cp(resolve(nextOutput, 'static'), resolve(clientDir, '_next', 'static'), { recursive: true });
await cp(publicDir, clientDir, { recursive: true });
await cp(resolve(nextOutput, 'server', 'app', 'index.html'), resolve(clientDir, 'index.html'));
await cp(resolve(nextOutput, 'server', 'app', '_not-found.html'), resolve(clientDir, '404.html'));
await cp(resolve(root, 'worker', 'sites-entry.mjs'), resolve(serverDir, 'index.js'));

// Next emits an optimized, hashed copy for imported images. Keep that copy and
// remove the duplicate source image from the deploy bundle.
await unlink(resolve(clientDir, 'images', 'storyroots-himalayan-dawn.png')).catch(() => {});

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

async function filesInside(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesInside(path));
    if (entry.isFile()) files.push(path);
  }

  return files;
}

const embeddedAssets = {};
for (const file of await filesInside(clientDir)) {
  const path = `/${relative(clientDir, file).split(sep).join('/')}`;
  embeddedAssets[path] = {
    body: (await readFile(file)).toString('base64'),
    contentType: contentTypes[extname(file).toLowerCase()] || 'application/octet-stream',
  };
}

await writeFile(
  resolve(serverDir, 'static-assets.js'),
  `export const STATIC_ASSETS = ${JSON.stringify(embeddedAssets)};\n`,
  'utf8',
);

console.log('Prepared StoryRoots for Sites hosting.');
