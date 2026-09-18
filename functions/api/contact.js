// Cloudflare Pages Functions — 問い合わせフォームの受け口。
// 環境変数 RESEND_API_KEY と CONTACT_TO を設定すると実際にメールが飛ぶ。
// 未設定のときは 503 を返し、ページ側は「メールでお願いします」を表示する。

const MAX = 4000;

export async function onRequestPost({ request, env }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  // 蜜壺。人間は触らない隠しフィールドなので、埋まっていたら黙って受け流す。
  if (form.get('company')) return json({ ok: true });

  const name = String(form.get('name') || '').trim().slice(0, 200);
  const email = String(form.get('email') || '').trim().slice(0, 320);
  const message = String(form.get('message') || '').trim().slice(0, MAX);
  const lang = form.get('lang') === 'en' ? 'en' : 'ja';

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'invalid' }, 422);
  }

  const key = env.RESEND_API_KEY;
  const to = env.CONTACT_TO || 'contact@l4na.com';
  const from = env.CONTACT_FROM || 'FREE WAND <noreply@l4na.com>';
  if (!key) return json({ error: 'not_configured' }, 503);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `[FREE WAND] ${lang === 'en' ? 'Enquiry' : 'お問い合わせ'} — ${name}`,
      text: `${name} <${email}>\nlang: ${lang}\n\n${message}\n`,
    }),
  });

  if (!res.ok) return json({ error: 'send_failed' }, 502);

  // JS を切っている人にも結果が見えるように、通常の POST には HTML を返す。
  if (!(request.headers.get('accept') || '').includes('application/json')) {
    return new Response(thanks(lang), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
  return json({ ok: true });
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const thanks = (lang) => `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${lang === 'en' ? 'Thank you' : 'ありがとうございます'} — FREE WAND</title>
<link rel="stylesheet" href="/assets/styles.css"></head>
<body><main class="wrap"><section class="title-page">
<h1 class="wordmark">FREE WAND</h1>
<p class="lead">${lang === 'en' ? 'Thank you. We will be in touch.' : 'ありがとうございます。返信をお待ちください。'}</p>
<a class="btn" href="${lang === 'en' ? '/en/' : '/'}">${lang === 'en' ? 'Back' : 'もどる'}</a>
</section></main></body></html>`;
