import { readFileSync } from 'node:fs';
import { load, lookup } from './ext/host.js';

const run = await load(readFileSync(new URL('./ext/pkg/alx_web_bg.wasm', import.meta.url)));
const fetchText = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
};
const cases = [
  [{ url: 'https://bsky.app/profile/jay.bsky.team' }, /^show did:plc:oky5czdrnfjpqslsw2a5iclo old 2022-11-17 /],
  [{ url: 'https://witchsky.app/profile/did:plc:z72i7hdynmk6r22z27h6tvur' }, /^show did:plc:z72i7hdynmk6r22z27h6tvur old 2023-04-12 /],
  [{ url: 'https://blacksky.community/profile/jay.bsky.team/media' }, /^show did:plc:oky5czdrnfjpqslsw2a5iclo /],
  [{ url: 'https://mu.social/u/x', hints: ['at://did:plc:oky5czdrnfjpqslsw2a5iclo/app.bsky.actor.profile/self'], header: true }, /^show did:plc:oky5czdrnfjpqslsw2a5iclo /],
  [{ url: 'https://bsky.app/notifications', hints: ['at://did:plc:oky5czdrnfjpqslsw2a5iclo/app.bsky.actor.profile/self'] }, /^none$/],
  [{ url: 'https://bsky.app/profile/no-such-handle-zz9.bsky.social' }, /^error can't resolve/],
];
let bad = 0;
for (const [signals, want] of cases) {
  const out = await lookup(run, signals, fetchText);
  const ok = want.test(out);
  bad += !ok;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${signals.url} -> ${out}`);
}
process.exit(bad ? 1 : 0);
