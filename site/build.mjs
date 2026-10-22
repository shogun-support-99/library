/* Build the site: front-matter, includes, JSON-LD, Tailwind, static files.

   node build.mjs           build once
   node build.mjs --watch    rebuild on change

   Each page starts with a small comment block:

     <!--@
     title=About AR Smart Library | Namkum, Ranchi
     desc=One line for search results and sharing.
     slug=about
     @-->

   The slug sets the canonical URL, the active nav item and the breadcrumb. */

import { readFile, writeFile, mkdir, cp, rm, readdir, watch } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const srcDir = path.join(root, "src");
const distDir = path.join(root, "dist");
/* The same source builds for two hosts. GitHub Pages serves the site from a
   /library/ sub-path, Vercel serves it from the domain root, so the base and
   the canonical host come from the environment. Defaults stay on GitHub Pages.

     SITE_URL=https://arsmartlibrary.vercel.app/ BASE_PATH=/ npm run build */
const SITE = (process.env.SITE_URL || "https://shogun-support-99.github.io/library/").replace(/\/?$/, "/");
const BASE = (process.env.BASE_PATH || "/library/").replace(/^(?!\/)/, "/").replace(/\/?$/, "/");
const watchMode = process.argv.includes("--watch");
/* Vercel Web Analytics is served from the deployment itself at a path that only
   exists on Vercel. GitHub Pages would answer the same request with a 404, so
   the snippet is injected only when the build is running on Vercel. */
const ANALYTICS = process.env.VERCEL
  ? '<script defer src="/_vercel/insights/script.js"></script>'
  : "";

/* ------------------------------------------------------------ front matter */

const FRONT = /^<!--@([\s\S]*?)@-->\s*/;

function parseFront(raw) {
  const m = raw.match(FRONT);
  if (!m) throw new Error("Missing front matter");
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf("=");
    if (i === -1) continue;
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: raw.slice(m[0].length) };
}

/* --------------------------------------------------------------- includes */

const INCLUDE = /<!--\s*include:\s*([\w./-]+)\s*-->/g;
const partialCache = new Map();

async function loadPartial(name) {
  if (partialCache.has(name)) return partialCache.get(name);
  const text = await readFile(path.join(srcDir, "partials", name), "utf8");
  partialCache.set(name, text);
  return text;
}

async function renderIncludes(html) {
  for (let pass = 0; pass < 2; pass += 1) {
    const found = [...html.matchAll(INCLUDE)];
    if (!found.length) break;
    for (const m of found) {
      html = html.replace(m[0], await loadPartial(m[1]));
    }
  }
  if (INCLUDE.test(html)) throw new Error("Unresolved include");
  return html;
}

/* ----------------------------------------------------------------- tokens */

const NAV = [
  ["about", "About"],
  ["facilities", "Facilities"],
  ["membership", "Membership"],
  ["location", "Location"],
  ["faq", "Questions"],
  ["contact", "Contact"],
];

const NAMES = Object.fromEntries(NAV.concat([["index", "Home"]]));

function canonical(slug) {
  // SITE always has a trailing slash and BASE is where the site is mounted
  return slug === "index" ? SITE : `${SITE}${slug}.html`;
}

function jsonld(meta, slug) {
  const library = {
    "@context": "https://schema.org",
    "@type": "Library",
    name: "AR Smart Library",
    description:
      "A 24-hour reading and study library at Sadabahar Chowk, Namkum, Ranchi, Jharkhand.",
    url: SITE,
    image: `${SITE}assets/og-image.png`,
    telephone: "+917070549845",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1st Floor, Kamla Enclave, Sadabahar Chowk, beside Katyayni Sweets",
      addressLocality: "Namkum",
      addressRegion: "Jharkhand",
      postalCode: "834010",
      addressCountry: "IN",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    sameAs: ["https://maps.app.goo.gl/W3mpeq8EDtGj3rn9A"],
    areaServed: { "@type": "Place", name: "Namkum, Ranchi" },
  };

  const blocks = [{ "@context": "https://schema.org", "@type": "WebPage", name: meta.title,
    description: meta.desc, url: canonical(slug), isPartOf: { "@type": "WebSite", name: "AR Smart Library", url: SITE } }];

  if (slug === "index") blocks.push(library);

  if (slug !== "index") {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: NAMES[slug] || meta.title, item: canonical(slug) },
      ],
    });
  }

  if (slug === "404") return "";

  return blocks.map((b) => `<script type="application/ld+json">\n${JSON.stringify(b, null, 2)}\n</script>`).join("\n");
}

function paint(html, meta, slug) {
  const current = slug === "index" ? "index" : slug;

  html = html
    .replaceAll("{{URL}}", canonical(slug))
    .replaceAll("{{JSONLD}}", jsonld(meta, slug))
    .replaceAll("{{ROOT}}", BASE)
    .replaceAll("{{OG_IMAGE}}", `${SITE}assets/og-image.png`)
    .replaceAll("{{ANALYTICS}}", ANALYTICS);

  // every front-matter key is a token: {{TITLE}}, {{CLOSE}}, and so on
  for (const [key, value] of Object.entries(meta)) {
    html = html.replaceAll(`{{${key.toUpperCase()}}}`, value);
  }

  // the nav marks itself: any link carrying data-nav="<slug>" is the current page
  html = html.replace(/<a\s([^>]*?)data-nav="([^"]+)"([^>]*)>/g, (whole, before, target, after) => {
    if (target !== current) return whole;
    let attrs = `${before}data-nav="${target}"${after}`;
    const cls = attrs.match(/class="([^"]*)"/);
    attrs = cls
      ? attrs.replace(cls[0], `class="${cls[1]} is-current"`)
      : `class="is-current" ${attrs}`;
    if (!/aria-current=/.test(attrs)) attrs = `${attrs} aria-current="page"`;
    return `<a ${attrs.replace(/\s+/g, " ").replace(/\s+>/g, ">")}>`;
  });

  if (/\{\{[A-Z_]+\}\}/.test(html)) {
    const left = html.match(/\{\{[A-Z_]+\}\}/g);
    throw new Error(`Unfilled token(s) on ${slug}: ${[...new Set(left)].join(", ")}`);
  }

  return html;
}

/* ------------------------------------------------------------------ build */

async function build() {
  partialCache.clear();
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  const files = (await readdir(path.join(srcDir, "pages"))).filter((f) => f.endsWith(".html"));

  for (const file of files) {
    const slug = file.replace(".html", "");
    const raw = await readFile(path.join(srcDir, "pages", file), "utf8");
    const { meta, body } = parseFront(raw);
    meta.robots ??= "index, follow, max-image-preview:large";
    const html = paint(await renderIncludes(body), meta, slug);
    await writeFile(path.join(distDir, file), html);
  }

  execFileSync(
    "npx",
    ["@tailwindcss/cli", "-i", "src/input.css", "-o", "dist/styles.css", "--minify"],
    { stdio: "inherit", cwd: root }
  );

  await cp(path.join(root, "assets"), path.join(distDir, "assets"), { recursive: true });
  for (const f of ["site.webmanifest", "app.js"]) {
    await cp(path.join(root, f), path.join(distDir, f));
  }

  const priority = { "index": "1.0", location: "0.9", about: "0.8", facilities: "0.8", membership: "0.8" };
  const today = new Date().toISOString().slice(0, 10);
  const urls = files
    .map((f) => f.replace(".html", ""))
    .filter((slug) => slug !== "404")
    .sort((a, b) => (a === "index" ? -1 : b === "index" ? 1 : a.localeCompare(b)))
    .map((slug) =>
      [
        "  <url>",
        `    <loc>${canonical(slug)}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        "    <changefreq>monthly</changefreq>",
        `    <priority>${priority[slug] || "0.7"}</priority>`,
        "  </url>",
      ].join("\n")
    );

  await writeFile(
    path.join(distDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
  );
  await writeFile(
    path.join(distDir, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`
  );

  await writeFile(path.join(distDir, ".nojekyll"), "");
  console.log(`built ${files.length} pages -> dist/`);
}

await build();

if (watchMode) {
  console.log("watching src/ …");
  let timer = null;
  const watcher = watch(srcDir, { recursive: true });
  for await (const _ of watcher) {
    clearTimeout(timer);
    timer = setTimeout(() => build().catch((e) => console.error(e.message)), 120);
  }
}
