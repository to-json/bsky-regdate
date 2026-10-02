import init, { compile, set_file, begin_run, take_stdout, take_stderr } from './pkg/alx_web.js';
import { SOURCES } from './alx/sources.js';

const encoder = new TextEncoder();
const MAX_STEPS = 8;
const writeFile = (path, text) => set_file(path, encoder.encode(text));
const singleLine = (text) => String(text).replace(/[\r\n]+/g, ' ');

async function instantiateProgram(compiler) {
  const program = await WebAssembly.compile(compile('main.alx', SOURCES['main.alx']));
  const runtime = {};
  for (const { module, name } of WebAssembly.Module.imports(program)) {
    if (module === 'rt') runtime[name] = compiler[name];
  }
  return WebAssembly.instantiate(program, { env: { memory: compiler.memory }, rt: runtime });
}

function runOnce(program, request, bodies) {
  for (const [name, body] of Object.entries(bodies)) writeFile(`body/${name}`, body);
  writeFile('request', request);
  begin_run();
  try {
    program.exports.main();
  } catch (crash) {
    return `error ${take_stderr().trim() || crash}`;
  }
  return take_stdout().trim();
}

export async function load(wasmSource) {
  const compiler = await init({ module_or_path: wasmSource });
  for (const [path, text] of Object.entries(SOURCES)) writeFile(path, text);
  const program = await instantiateProgram(compiler);
  return (request, bodies) => runOnce(program, request, bodies);
}

function initialRequest({ url, hints = [], header }, now) {
  const lines = [`now ${now.toISOString()}`, `url ${singleLine(url)}`, ...hints.map((hint) => `hint ${singleLine(hint)}`)];
  if (header) lines.push('header');
  return lines.map((line) => `${line}\n`).join('');
}

const fetchRequest = (answer) => /^fetch (\S+) (\S+)$/.exec(answer);

export async function lookup(run, signals, fetchText, now = new Date()) {
  let request = initialRequest(signals, now);
  const bodies = {};
  for (let step = 0; step < MAX_STEPS; step++) {
    const answer = run(request, bodies);
    const wanted = fetchRequest(answer);
    if (!wanted) return answer;
    const [, name, url] = wanted;
    try {
      bodies[name] = await fetchText(url);
      request += `got ${name} body/${name}\n`;
    } catch {
      request += `failed ${name}\n`;
    }
  }
  return 'error too many steps';
}
