# bsky-regdate

Browser extension: shows a Bluesky account's registration date under its bio.

## Appviews

| Site | Status |
| --- | --- |
| bsky.app | i use this |
| witchsky.app | tested once |
| blacksky.community | tested once |
| mu.social (Eurosky) | tested once |
| deer.social | should work |
| other social-app forks | add 'em to `manifest.json` `matches`, might Just Work |

## Commands

| Command | Does |
| --- | --- |
| `./build.sh` | Bundle `alx/` into `ext/alx/sources.js` (and copy `$ALX_WEB_PKG` into `ext/pkg/` if set), pack `dist/bsky-regdate.xpi` |
| `alx test alx/regdate` | Unit tests |
| `./host.sh <url>` (needs `alx` on PATH or `$ALX`) | same shit, but in ur terminal |
| `node test.mjs` | tests |

Install: 
Chrome → chrome://extensions → Load unpacked → `ext/`. 
Firefox 121+ → about:debugging → Load Temporary Add-on → `ext/manifest.json`.

`ext/pkg/` is a vendored build of the Alexandrite compiler (wasm)
Apache-2.0 WITH LLVM-exception; see `ext/pkg/LICENSE`.

Licensed under Apache-2.0 (`LICENSE`), except `ext/pkg/`.
