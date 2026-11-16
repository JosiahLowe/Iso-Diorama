import http from 'node:http';
import { readFile } from 'node:fs/promises';
import './build.mjs';

const port = Number(process.env.PORT || 3000);
const routes = new Map([['/', ['index.html','text/html; charset=utf-8']],['/index.html',['index.html','text/html; charset=utf-8']],['/scene.svg',['scene.svg','image/svg+xml']]]);
http.createServer(async (req,res) => {
  const route = routes.get(new URL(req.url,'http://localhost').pathname);
  if (!route) { res.writeHead(404); res.end(); return; }
  try {
    const data = await readFile(new URL(`../dist/${route[0]}`,import.meta.url));
    res.writeHead(200, {'Content-Type':route[1], 'Cache-Control':'no-cache'});
    res.end(data);
  } catch { res.writeHead(500); res.end('Unable to load scene'); }
}).listen(port,'0.0.0.0',() => console.log(`Diorama running on port ${port}`));
