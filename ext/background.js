import { load, lookup } from './host.js';

const CACHE_LIFETIME_MS = 10 * 60 * 1000;
const cachedResponses = new Map();
const program = load(chrome.runtime.getURL('pkg/alx_web_bg.wasm'));

const fresh = (entry) => entry && Date.now() - entry.at < CACHE_LIFETIME_MS;
const remember = (url, entry) => cachedResponses.set(url, { at: Date.now(), ...entry });

async function download(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function fetchText(url) {
  const cached = cachedResponses.get(url);
  if (fresh(cached)) {
    if (cached.failed) throw new Error('recently failed');
    return cached.text;
  }
  try {
    const text = await download(url);
    remember(url, { text });
    return text;
  } catch (failure) {
    remember(url, { failed: true });
    throw failure;
  }
}

chrome.runtime.onMessage.addListener((message, _sender, reply) => {
  if (message?.type !== 'regdate') return false;
  program
    .then((run) => lookup(run, message.signals, fetchText))
    .then(reply, (failure) => reply(`error ${failure}`));
  return true;
});
