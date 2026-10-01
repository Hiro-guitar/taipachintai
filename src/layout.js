// 共通レイアウト（ヘッダー・フッター・<head>）
export const site = {
  name: "タイパ賃貸",
  origin: "https://taipachintai.com",
  homeTitle: "上京・遠方からの東京のお部屋探し｜タイパ賃貸（仲介手数料0円〜）",
  description:
    "上京・遠方から東京へ引っ越す人のための賃貸仲介。地元にいながら、ネットで見つけたお部屋をLINEで送るだけで申込から契約まで進められます。先に申し込めば仲介手数料は0円か3.3万円。",
  line: "https://lin.ee/nbLxeOV",
  company: "合同会社えほうまき",
  license: "神奈川県知事（1）第32246号",
  address: "神奈川県横浜市保土ケ谷区和田2-18-4-103",
  email: "contact@ehomaki.com",
};

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const lineIcon = `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 .9l-.1.9c0 .3-.2 1 .9.5s6-3.5 8.2-6.1c1.5-1.6 2.3-3.3 2.3-5.1C22 6.6 17.5 3 12 3Z"/></svg>`;

export function lineButton(label = "LINEで物件を送る（無料）", cls = "btn-line") {
  return `<a class="${cls}" href="${site.line}" target="_blank" rel="noopener">${lineIcon}<span>${label}</span></a>`;
}

function jsonLd(p) {
  const org = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: site.name,
    url: site.origin + "/",
    description: site.description,
    areaServed: ["東京都", "神奈川県", "埼玉県", "千葉県"],
    parentOrganization: { "@type": "Organization", name: site.company },
    email: site.email,
  };
  const blocks = [];
  if (p.home) blocks.push(org);
  if (p.article) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: p.article.title,
      description: p.article.description,
      datePublished: p.article.date,
      dateModified: p.article.updated || p.article.date,
      author: { "@type": "Organization", name: site.company },
      publisher: { "@type": "Organization", name: site.company },
      mainEntityOfPage: site.origin + p.url,
    });
  }
  if (p.faq) blocks.push(p.faq);
  return blocks.map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`).join("\n");
}

export function layout(p) {
  const canonical = site.origin + p.url;
  // index.html の中に FAQ の構造化データを埋め込めるよう、本文から抽出
  const strip = (h) => h.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const qa = [...p.body.matchAll(/<details>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)];
  if (qa.length) p.faq = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: qa.map((m) => ({ "@type": "Question", name: strip(m[1]), acceptedAnswer: { "@type": "Answer", text: strip(m[2]) } })),
  };
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
<link rel="canonical" href="${canonical}">
${p.noindex ? '<meta name="robots" content="noindex">' : ""}
<meta property="og:type" content="${p.type || "website"}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="${site.name}">
<meta property="og:locale" content="ja_JP">
<meta property="og:image" content="${site.origin}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#F6D54A">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@700;900&family=Noto+Sans+JP:wght@400;500;700&display=swap">
<link rel="stylesheet" href="/style.css">
${jsonLd(p)}
</head>
<body${p.home ? ' class="home"' : ""}>
<header class="site-head">
  <div class="wrap head-row">
    <a class="logo" href="/"><svg class="logo-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2.5h12M6 21.5h12M7.5 2.5v3.2c0 2 1.3 3.4 4.5 6.3-3.2 2.9-4.5 4.3-4.5 6.3v3.2M16.5 2.5v3.2c0 2-1.3 3.4-4.5 6.3 3.2 2.9 4.5 4.3 4.5 6.3v3.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9.5 19.5c.6-1.6 1.4-2.3 2.5-3.2 1.1.9 1.9 1.6 2.5 3.2z" fill="currentColor"/></svg>タイパ賃貸</a>
    <nav class="head-nav" aria-label="メニュー">
      <a href="/#why">できること</a>
      <a href="/#price">料金</a>
      <a href="/#flow">流れ</a>
      <a href="/#faq">よくある質問</a>
      <a href="/articles/">お部屋探しガイド</a>
    </nav>
  </div>
</header>
${p.body}
<footer class="site-foot">
  <div class="wrap foot-grid">
    <div>
      <p class="foot-logo">タイパ賃貸</p>
      <p class="foot-tag">内見に行けなくても決まるお部屋探し</p>
    </div>
    <dl class="foot-company">
      <div><dt>運営会社</dt><dd>${site.company}</dd></div>
      <div><dt>免許番号</dt><dd>宅地建物取引業 <span class="nw">${site.license}</span></dd></div>
      <div><dt>所在地</dt><dd>${site.address.replace(/(和田.*)$/, '<span class="nw">$1</span>')}</dd></div>
      <div><dt>お問い合わせ</dt><dd>${site.email}</dd></div>
    </dl>
    <nav class="foot-links" aria-label="フッター">
      <a href="/articles/">お部屋探しガイド</a>
      <a href="/termsandprivacy/#terms">利用規約</a>
      <a href="/termsandprivacy/#privacy">個人情報保護方針</a>
    </nav>
  </div>
  <p class="wrap copy">© ${new Date().getFullYear()} ${site.company}</p>
</footer>
<div class="line-bar">${lineButton("LINEで物件を送る（無料）")}</div>
</body>
</html>
`;
}

export function articleBody(a) {
  return `<main class="wrap article">
  <nav class="crumbs" aria-label="パンくず"><a href="/">トップ</a> › <a href="/articles/">お部屋探しガイド</a></nav>
  <article>
    <header class="article-head">
      <h1>${esc(a.title)}</h1>
      <p class="meta">公開 ${esc(a.date)}${a.updated ? `　更新 ${esc(a.updated)}` : ""}</p>
    </header>
    <div class="prose">${a.html}</div>
  </article>
  <aside class="article-cta">
    <p class="cta-title">気になる部屋のURLを、LINEで送るだけ。</p>
    <p>内見に行かずに申し込めるお部屋なら、仲介手数料は<strong>0円または3.3万円</strong>です。内見のご案内をしないぶん、金額を下げています。</p>
    <p>URLを送っていただければ、そのお部屋が内見なしで申し込めるか、まだ空いているかをお調べしてご返信します。</p>
    ${lineButton()}
  </aside>
</main>`;
}

export function articleIndexBody(list, compact) {
  if (!list.length) return "";
  return `<ul class="article-list${compact ? " compact" : ""}">${list
    .map(
      (a) => `<li><a href="${a.url}"><span class="al-title">${esc(a.title)}</span><span class="al-desc">${esc(a.description)}</span></a></li>`
    )
    .join("")}</ul>`;
}
