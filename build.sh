#!/bin/sh
set -e
here=$(cd "$(dirname "$0")" && pwd)
# ext/pkg holds a vendored build of the Alexandrite compiler; ALX_WEB_PKG replaces it.
if [ -n "$ALX_WEB_PKG" ]; then
  [ -f "$ALX_WEB_PKG/alx_web_bg.wasm" ] || { echo "no $ALX_WEB_PKG/alx_web_bg.wasm" >&2; exit 1; }
  cp "$ALX_WEB_PKG/alx_web.js" "$ALX_WEB_PKG/alx_web_bg.wasm" "$here/ext/pkg/"
fi
mkdir -p "$here/ext/alx"
node - "$here/alx" "$here/ext/alx/sources.js" <<'JS'
const fs = require('fs'), path = require('path');
const [root, out] = process.argv.slice(2);
const files = {};
(function walk(dir) {
  for (const f of fs.readdirSync(dir).sort()) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.alx') && !f.endsWith('_test.alx')) files[path.relative(root, p)] = fs.readFileSync(p, 'utf8');
  }
})(root);
fs.writeFileSync(out, 'export const SOURCES = ' + JSON.stringify(files, null, 1) + ';\n');
console.log(Object.keys(files).join(' '));
JS
mkdir -p "$here/dist"
rm -f "$here/dist/bsky-regdate.xpi"
(cd "$here/ext" && zip -qr -X "$here/dist/bsky-regdate.xpi" . -x '.*')
echo "ext/ ready; dist/bsky-regdate.xpi built"
