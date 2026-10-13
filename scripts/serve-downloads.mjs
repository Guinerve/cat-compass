import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(dirname(fileURLToPath(import.meta.url))), "release");
const files = new Set(["Cat-Compass-0.2.0-mac-arm64.dmg", "Cat-Compass-0.2.0-mac-arm64.zip", "SHA256SUMS.txt"]);
const server = createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "no-store");
  if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405); res.end(); return; }
  let name;
  try { name = decodeURIComponent(new URL(req.url, "http://download.local").pathname.slice(1)); } catch { res.writeHead(400); res.end(); return; }
  if (!name) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'");
    res.end(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Cat Compass downloads</title><style>body{max-width:650px;margin:60px auto;padding:24px;background:#f7f6f2;color:#253c36;font:16px/1.7 system-ui}a{color:#246653}h1{font:40px Georgia}li{margin:18px 0}</style><h1>Cat Compass 0.2.0</h1><p>Offline cat care for an Apple Silicon Mac. This build is unsigned and not notarized. Only install software you trust.</p><ul>${[...files].map(f => `<li><a href="/${encodeURIComponent(f)}">${f}</a></li>`).join("")}</ul><p>Phone calendar export, private profile transfer, care guides and source links are included. A trusted HTTPS host is needed for the phone web app. Clinical content has not received veterinary approval.</p></html>`);
    return;
  }
  if (!files.has(name)) { res.writeHead(404); res.end(); return; }
  try {
    const path = join(root, name), file = await stat(path);
    if (!file.isFile()) throw new Error("Not a regular file");
    let start = 0, end = file.size - 1;
    if (req.headers.range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
      if (!match || !Number.isSafeInteger(Number(match[1])) || Number(match[1]) >= file.size || (match[2] && (!Number.isSafeInteger(Number(match[2])) || Number(match[2]) < Number(match[1])))) {
        res.writeHead(416, { "Content-Range": `bytes */${file.size}` }); res.end(); return;
      }
      start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), end) : end;
      res.statusCode = 206; res.setHeader("Content-Range", `bytes ${start}-${end}/${file.size}`);
    }
    res.setHeader("Accept-Ranges", "bytes"); res.setHeader("Content-Length", end - start + 1);
    res.setHeader("Content-Type", name.endsWith(".txt") ? "text/plain; charset=utf-8" : "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(name)}`);
    if (req.method === "HEAD") { res.end(); return; }
    const stream = createReadStream(path, { start, end });
    stream.on("error", () => res.destroy()); res.on("close", () => stream.destroy()); stream.pipe(res);
  } catch { res.writeHead(404); res.end("Build file not found. Run npm run desktop:dist first."); }
});
server.on("error", error => { console.error(`Download server did not start: ${error.message}`); process.exitCode = 1; });
server.listen(5198, "0.0.0.0", () => console.log("Cat Compass downloads: port 5198, bound to 0.0.0.0. No port fallback."));
