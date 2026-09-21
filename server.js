/**
 * رواسي للمقاولات العامة — minimal zero-dependency static file server.
 * Serves the static landing page and is what Railway (Nixpacks) runs via `npm start`.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

function safeJoin(base, target) {
  const targetPath = path.posix.normalize(target).replace(/^(\.\.[/\\])+/, "");
  return path.join(base, targetPath);
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);

  // Security headers on every response
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");

  if (urlPath === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  const resolvedPath = urlPath.endsWith("/") ? urlPath + "index.html" : urlPath;
  let filePath = safeJoin(ROOT, resolvedPath === "/index.html" ? "/index.html" : resolvedPath);

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // Fallback to the nearest index.html: /ar/... falls back to the Arabic
      // section's own index, everything else falls back to the English root
      // (clean URLs / unknown paths on this single-page-per-locale site).
      filePath = urlPath.startsWith("/ar/") || urlPath === "/ar"
        ? path.join(ROOT, "ar", "index.html")
        : path.join(ROOT, "index.html");
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    const cacheControl = ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable";

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("404 - الصفحة غير موجودة");
        return;
      }
      res.writeHead(200, { "Content-Type": contentType, "Cache-Control": cacheControl });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Rawasi landing page listening on port ${PORT}`);
});
