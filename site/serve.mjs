/* Local preview server for the built site.

   `npm run serve` used to be `python3 -m http.server --directory dist`, which
   serves dist at the domain root. The default build is mounted at `/library/`
   (that is what GitHub Pages uses), so every stylesheet, script and internal
   link 404'd on localhost and the preview looked broken.

   This serves the same dist at both shapes: `/` and `/library/`. Node builtins
   only, no dependencies.

     node serve.mjs           http://localhost:8080/
     node serve.mjs 3000      a different port */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.join(process.cwd(), "dist");
const port = Number(process.argv[2] || process.env.PORT || 8080);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

async function resolveFile(urlPath) {
  // the site is mounted at /library/ on Pages, at / on Vercel: accept both
  let rel = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  if (rel.startsWith("/library/")) rel = rel.slice("/library".length);
  if (rel === "/library") rel = "/";
  if (rel.endsWith("/")) rel += "index.html";

  const target = path.join(root, path.normalize(rel).replace(/^(\.\.[/\\])+/, ""));
  if (!target.startsWith(root)) return null; // no path traversal

  try {
    const info = await stat(target);
    if (info.isDirectory()) return resolveFile(rel + "/");
    return target;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const file = await resolveFile(req.url || "/");
  if (!file) {
    const notFound = path.join(root, "404.html");
    const body = await readFile(notFound).catch(() => "Not found");
    res.writeHead(404, { "content-type": TYPES[".html"] });
    res.end(body);
    return;
  }

  const body = await readFile(file);
  res.writeHead(200, {
    "content-type": TYPES[path.extname(file)] || "application/octet-stream",
    // the preview must never lie about being up to date
    "cache-control": "no-store",
  });
  res.end(body);
}).listen(port, "0.0.0.0", () => {
  console.log(`serving dist at http://localhost:${port}/ and /library/`);
});
