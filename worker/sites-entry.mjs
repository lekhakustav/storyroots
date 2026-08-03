import { STATIC_ASSETS } from './static-assets.js';
import { handleStoryRootsInterest } from './storyroots-interest.mjs';

const decodedAssets = new Map();

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function serveAsset(pathname, method) {
  const asset = STATIC_ASSETS[pathname];
  if (!asset) return null;

  let body = decodedAssets.get(pathname);
  if (!body) {
    const binary = atob(asset.body);
    body = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    decodedAssets.set(pathname, body);
  }

  return new Response(method === 'HEAD' ? null : body, {
    headers: {
      'Content-Type': asset.contentType,
      ...(pathname.startsWith('/_next/static/')
        ? { 'Cache-Control': 'public, max-age=31536000, immutable' }
        : { 'Cache-Control': 'no-cache' }),
    },
  });
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/storyroots-interest') {
      if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
      return handleStoryRootsInterest(request, env);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed.', { status: 405 });
    }

    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
    const assetResponse = serveAsset(pathname, request.method);
    if (assetResponse) return assetResponse;

    const notFoundResponse = serveAsset('/404.html', request.method);
    return new Response(notFoundResponse?.body || 'Not found.', {
      status: 404,
      headers: notFoundResponse?.headers,
    });
  },
};

export default worker;
