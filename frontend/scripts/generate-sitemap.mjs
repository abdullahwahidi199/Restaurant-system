import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "../public");
const siteUrl = "https://pakhlai.com";
const routes = ["/", "/about", "/founder", "/privacy", "/terms"];
const lastmod = new Date().toISOString().slice(0, 10);

const urlset = routes
  .map((route) => {
    const loc = `${siteUrl}${route === "/" ? "" : route}`;

    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route === "/" ? "weekly" : "monthly"}</changefreq>
    <priority>${route === "/" ? "1.0" : "0.8"}</priority>
  </url>`;
  })
  .join("\n");

mkdirSync(publicDir, { recursive: true });
writeFileSync(
  resolve(publicDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>
`,
);
