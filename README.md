# free-wand-lp

TGS 2026 出展作品 **FREE WAND** の紹介ページ。日本語 (`/`) と英語 (`/en/`) の 2 枚。
Cloudflare Pages へそのまま載る静的サイトで、**依存パッケージはゼロ**。

作品本体（モニター側 + 杖アプリ）は別リポジトリ `magic_mirror` にある。
ここにあるのは紹介ページだけで、作品のコードは持ち込まない。

## 組み立て

```sh
npm run build     # dist/ を作る
npm run dev       # dist/ を作って http://localhost:4321/ で見る
```

`SITE_ORIGIN` を渡すと canonical・OGP・sitemap の URL がそれに変わる。

```sh
SITE_ORIGIN=https://free-wand.example npm run build
```

## 中身

| 場所 | 何が入っているか |
|---|---|
| `content/ja.json` / `content/en.json` | **文章はすべてここ**。同じ鍵で日英が対応する |
| `src/template.mjs` | 1 ページ分の HTML を組み立てる。日英で同じ関数を通す |
| `src/styles.css` | 紙と墨の一色。色を持つのはページの中の図版だけ |
| `public/assets/images/` | 紋章・九つの印・作法の四図・灯籠（すべて透過 PNG） |
| `functions/api/contact.js` | 問い合わせの受け口（Pages Functions） |
| `build.mjs` | `dist/` を作る。robots.txt・sitemap.xml・`_headers` もここで書き出す |

**文言を直すときは `content/*.json` だけを触る。** 片方だけ直すと日英がずれるので、
必ず両方を同じ変更で直すこと。

## Cloudflare Pages

| 項目 | 値 |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable | `SITE_ORIGIN`（本番の URL。省略時は `https://free-wand.pages.dev`） |

`functions/` はリポジトリ直下に置いてあれば Pages が自動で拾う。

### 問い合わせフォーム

`functions/api/contact.js` は [Resend](https://resend.com) に投げる。
Pages の環境変数に次を入れると実際にメールが飛ぶ。

| 変数 | 既定 | 備考 |
|---|---|---|
| `RESEND_API_KEY` | （必須） | 未設定だと 503 を返す |
| `CONTACT_TO` | `contact@l4na.com` | 受け取り先 |
| `CONTACT_FROM` | `FREE WAND <noreply@l4na.com>` | Resend 側で送信ドメインの認証が要る |

**未設定でもページは壊れない。** 送信に失敗すると
「お手数ですが contact@l4na.com までお願いします」と出て、メールアドレスは常に本文に出ている。

## 決めごと

- 文章と見た目を混ぜない。文面は JSON、組み方はテンプレート、見え方は CSS。
- 画像は透過 PNG のみ。紙の色は CSS 側（`--paper`）が持ち、画像は線だけを持つ。
- 書体は明朝（Shippori Mincho B1）と欧文のガラモン（EB Garamond）の二種だけ。増やさない。
- 会場の情報（ブース番号・日程）は `content/*.json` の `imprint` にある。
