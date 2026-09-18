// 1 ページ分の HTML を組み立てる。日本語版と英語版で同じ関数を通す。
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const IMG = '/assets/images';
const ELEMENTS = ['fire', 'water', 'wind'];
const GLYPH = { fire: 'ink-fire', water: 'ink-water', wind: 'ink-wind' };

function chapterHead(num, title) {
  return `      <header class="chapter-head">
        <p class="chapter-num">${esc(num)}</p>
        <h2 class="chapter-title">${esc(title)}</h2>
      </header>`;
}

function hangList(items) {
  const rows = items
    .map(
      (i) => `        <li class="hang-item">
          <p class="hang-num">${esc(i.n)}</p>
          <div class="hang-body">
            <h3>${esc(i.t)}</h3>
            <p>${esc(i.b)}</p>
          </div>
        </li>`
    )
    .join('\n');
  return `      <ol class="hang">\n${rows}\n      </ol>`;
}

function elementBlock(t, key) {
  const e = t[key];
  const glyphs = e.items
    .map(
      (s, i) => `          <li class="glyph">
            <span class="glyph-disc"><img src="${IMG}/${GLYPH[key]}-${i + 1}.png" alt="${esc(s.alt)}" width="340" height="340" loading="lazy" decoding="async"></span>
            <h4>${esc(s.name)}</h4>
            <p>${esc(s.body)}</p>
          </li>`
    )
    .join('\n');
  return `      <section class="element element--${key}">
        <header class="element-head">
          <img class="element-emblem" src="${IMG}/emblem-${key}.png" alt="${esc(e.alt)}" width="330" height="330" loading="lazy" decoding="async">
          <h3 class="element-name">${esc(e.name)}</h3>
          <p class="element-latin">${esc(e.latin)}</p>
        </header>
        <p class="element-read">${esc(e.read)}</p>
        <ol class="glyphs">
${glyphs}
        </ol>
      </section>`;
}

function diagram(t) {
  const box = (key) => `        <div class="dg-box">
          <h3>${esc(t.dg[key])}</h3>
          <p class="dg-stack">${esc(t.dg[key + 'Stack'])}</p>
          <p class="dg-note">${esc(t.dg[key + 'A'])}</p>
          <p class="dg-note">${esc(t.dg[key + 'B'])}</p>
        </div>`;
  return `      <figure class="figure">
        <div class="diagram">
${box('wand')}
          <div class="dg-conn">
            <p class="dg-arrow dg-arrow--fwd"><span class="dg-label">${esc(t.dg.up)}</span><span class="dg-line"></span></p>
            <p class="dg-arrow dg-arrow--back"><span class="dg-line dg-line--dashed"></span><span class="dg-label">${esc(t.dg.down)}</span></p>
          </div>
${box('disp')}
          <div class="dg-conn dg-conn--single">
            <p class="dg-arrow dg-arrow--fwd"><span class="dg-label">${esc(t.dg.out)}</span><span class="dg-line"></span></p>
          </div>
${box('world')}
        </div>
        <figcaption>${esc(t.figLabel)} — ${esc(t.figCap)}</figcaption>
      </figure>`;
}

export function page(lang, t, { origin = '' } = {}) {
  const other = lang === 'ja' ? 'en' : 'ja';
  const selfHref = lang === 'ja' ? '/' : '/en/';

  const imprint = t.imprint
    .map(
      (m) => `        <div class="imprint-item">
          <dt>${esc(m.k)}</dt>
          <dd>${esc(m.v)}</dd>
        </div>`
    )
    .join('\n');

  const steps = t.steps
    .map(
      (s, i) => `        <li class="step">
          <p class="step-num">${esc(s.n)}</p>
          <img src="${IMG}/step-${i + 1}.png" alt="${esc(s.alt)}" width="225" height="250" loading="lazy" decoding="async">
          <h3>${esc(s.t)}</h3>
          <p>${esc(s.b)}</p>
        </li>`
    )
    .join('\n');

  const makerLinks = t.makerLinks
    .map((l) => `        <li><a href="${esc(l.href)}" rel="me noopener">${esc(l.label)}</a></li>`)
    .join('\n');

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t.pageTitle)}</title>
<meta name="description" content="${esc(t.description)}">
<link rel="canonical" href="${origin}${selfHref}">
<link rel="alternate" hreflang="ja" href="${origin}/">
<link rel="alternate" hreflang="en" href="${origin}/en/">
<link rel="alternate" hreflang="x-default" href="${origin}/">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(t.pageTitle)}">
<meta property="og:description" content="${esc(t.description)}">
<meta property="og:locale" content="${lang === 'ja' ? 'ja_JP' : 'en_US'}">
<meta property="og:image" content="${origin}${IMG}/lantern.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${IMG}/lantern.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&amp;family=Shippori+Mincho+B1:wght@400;500;600;800&amp;display=swap">
<link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
<a class="skip" href="#main">${esc(t.skip)}</a>

<header class="rh">
  <div class="wrap rh-inner">
    <p class="rh-title">${esc(t.title)}</p>
    <nav class="lang" aria-label="${lang === 'ja' ? '言語' : 'Language'}">
      <span class="lang-current" aria-current="true">${esc(t.langName)}</span>
      <span class="lang-sep" aria-hidden="true"></span>
      <a href="${esc(t.otherHref)}" hreflang="${other}" lang="${other}">${esc(t.otherLangName)}</a>
    </nav>
  </div>
</header>

<main id="main">
  <div class="wrap">

    <section class="title-page">
      <img class="lantern" src="${IMG}/lantern.png" alt="" width="880" height="1420" fetchpriority="high" decoding="async">
      <h1 class="wordmark">${esc(t.title)}</h1>
      <p class="subtitle">${esc(t.subtitle)}</p>
      <span class="rule-short" aria-hidden="true"></span>
      <p class="lead">${esc(t.lead)}</p>
      <a class="btn" href="#grimoire">${esc(t.cta)}</a>
    </section>

    <dl class="imprint">
${imprint}
    </dl>
    <p class="shift-note">${esc(t.shiftNote)}</p>

    <section class="chapter" id="world">
${chapterHead(t.c1n, t.c1)}
      <p class="dropcap"><span class="dropcap-letter">${esc(t.c1cap)}</span>${esc(t.c1lead)}</p>
${hangList(t.c1items)}
      <div class="note">
        <p class="note-label">${esc(t.noteLabel)}</p>
        <p class="note-body">${esc(t.c1note)}</p>
      </div>
    </section>

    <section class="chapter" id="grimoire">
${chapterHead(t.c2n, t.c2)}
      <p class="chapter-lead">${esc(t.c2lead)}</p>
${ELEMENTS.map((k) => elementBlock(t, k)).join('\n')}
    </section>

    <section class="chapter" id="rite">
${chapterHead(t.c3n, t.c3)}
      <p class="chapter-lead">${esc(t.c3lead)}</p>
      <ol class="steps">
${steps}
      </ol>
      <p class="rite-note">${esc(t.c3note)}</p>
      <blockquote class="quote"><p>${esc(t.c3quote)}</p></blockquote>
    </section>

    <section class="chapter" id="build">
${chapterHead(t.c4n, t.c4)}
      <p class="chapter-lead">${esc(t.c4lead)}</p>
${diagram(t)}
${hangList(t.c4items)}
    </section>

    <section class="chapter" id="contact">
${chapterHead(t.c5n, t.c5)}
      <p class="chapter-lead">${esc(t.c5lead)}</p>
      <form class="form" method="post" action="/api/contact">
        <input type="hidden" name="lang" value="${lang}">
        <p class="hp" aria-hidden="true"><label>Leave this empty<input type="text" name="company" tabindex="-1" autocomplete="off"></label></p>
        <div class="field-row">
          <p class="field">
            <label for="f-name">${esc(t.fName)}</label>
            <input id="f-name" name="name" type="text" autocomplete="name" required>
          </p>
          <p class="field">
            <label for="f-mail">${esc(t.fMail)}</label>
            <input id="f-mail" name="email" type="email" autocomplete="email" required>
          </p>
        </div>
        <p class="field">
          <label for="f-body">${esc(t.fBody)}</label>
          <textarea id="f-body" name="message" rows="5" placeholder="${esc(t.fBodyPh)}" required></textarea>
        </p>
        <button class="btn btn--submit" type="submit">${esc(t.fSend)}</button>
        <p class="form-status" role="status" aria-live="polite"></p>
      </form>
      <p class="mail">
        <span class="mail-label">${esc(t.orMail)}</span>
        <a href="mailto:${esc(t.mail)}">${esc(t.mail)}</a>
      </p>
    </section>

    <footer class="colophon">
      <p class="colophon-label">${esc(t.colophonTitle)}</p>
      <p class="colophon-title">${esc(t.title)}</p>
      <p class="colophon-note">${esc(t.footerNote)}</p>
      <span class="rule-short" aria-hidden="true"></span>
      <p class="maker"><span class="maker-label">${esc(t.makerLabel)}</span> <span class="maker-name">${esc(t.maker)}</span></p>
      <ul class="maker-links">
${makerLinks}
      </ul>
      <p class="copyright">${esc(t.copyright)}</p>
    </footer>

  </div>
</main>

<script src="/assets/contact.js" defer></script>
</body>
</html>
`;
}
