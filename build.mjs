// content/*.json と src/template.mjs から dist/ を組み立てる。依存なし。
import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { page } from './src/template.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const ORIGIN = (process.env.SITE_ORIGIN || 'https://free-wand.pages.dev').replace(/\/$/, '');
const LANGS = [
  { lang: 'ja', out: 'index.html' },
  { lang: 'en', out: 'en/index.html' },
];

const read = async (p) => JSON.parse(await readFile(path.join(root, p), 'utf8'));

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'assets'), { recursive: true });

await cp(path.join(root, 'public'), dist, { recursive: true });
await cp(path.join(root, 'src/styles.css'), path.join(dist, 'assets/styles.css'));

for (const { lang, out } of LANGS) {
  const t = await read(`content/${lang}.json`);
  const html = page(lang, t, { origin: ORIGIN });
  const file = path.join(dist, out);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
  console.log(`  ${out}  ${(html.length / 1024).toFixed(1)} KB`);
}

// 送信フォームの進捗表示（JS が無くても普通の POST として動く）
const ja = await read('content/ja.json');
const en = await read('content/en.json');
const msg = (t) => ({ sending: t.formSending, ok: t.formOk, err: t.formErr });
await writeFile(
  path.join(dist, 'assets/contact.js'),
  `// 生成物。編集は build.mjs 側で。
const MSG = ${JSON.stringify({ ja: msg(ja), en: msg(en) })};
const form = document.querySelector('.form');
if (form) {
  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type="submit"]');
  const lang = document.documentElement.lang === 'en' ? 'en' : 'ja';
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = MSG[lang].sending;
    button.disabled = true;
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      status.textContent = MSG[lang].ok;
    } catch {
      status.textContent = MSG[lang].err;
    } finally {
      button.disabled = false;
    }
  });
}
`
);

await writeFile(
  path.join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`
);

const today = new Date().toISOString().slice(0, 10);
await writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${['/', '/en/']
  .map(
    (u) => `  <url>
    <loc>${ORIGIN}${u}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="ja" href="${ORIGIN}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${ORIGIN}/en/"/>
  </url>`
  )
  .join('\n')}
</urlset>
`
);

await writeFile(
  path.join(dist, '_headers'),
  `/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`
);

console.log(`built for ${ORIGIN}`);
