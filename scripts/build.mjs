import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { renderScene } from '../src/render.js';

const svg = renderScene();
await mkdir(new URL('../dist/', import.meta.url), {recursive:true});
await mkdir(new URL('../dist/runtime/', import.meta.url), {recursive:true});
for (const name of ['client','wander','navigation','scene','geometry','church-model','devil']) {
  await copyFile(new URL(`../src/${name}.js`,import.meta.url),new URL(`../dist/runtime/${name}.js`,import.meta.url));
}
await writeFile(new URL('../dist/scene.svg', import.meta.url), svg);
await writeFile(new URL('../dist/index.html', import.meta.url), `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#ffffff">
  <meta name="description" content="A peaceful miniature church garden, illustrated in isometric SVG.">
  <title>Iso Diorama — A quiet church garden</title>
  <link rel="icon" href="data:,">
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; background: #fff; }
    body { min-height: 100svh; display: grid; place-items: center; }
    main { width: 100%; display: grid; place-items: center; }
    svg { display: block; width: min(100%, 1160px); height: auto; max-height: 100svh; }
    @media (orientation: portrait) { svg { width: 100%; } }
  </style>
</head>
<body><main aria-label="Isometric church diorama">${svg}</main><script type="module" src="./runtime/client.js"></script></body>
</html>`);
console.log(`Built dist/index.html and dist/scene.svg (${Math.round(Buffer.byteLength(svg)/1024)} KB of SVG; no runtime dependencies).`);
