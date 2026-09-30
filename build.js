// タイパ賃貸 静的サイトのビルドスクリプト
// 使い方: npm run build  → dist/ に公開用ファイルが出力される
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { marked } from "marked";
import { site, layout, articleBody, articleIndexBody } from "./src/layout.js";

const DIST = "dist";
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

// 文節ごとに折り返せるよう <wbr> を挿入する（ブラウザの対応差を吸収）。
// 直前がひらがな/句読点で、直後がひらがな以外のとき、そこで改行を許可する。
const HIRA = /[\u3041-\u309F]/;
const PUNCT = /[、。，．！？）」』】]/;
const OPEN = /[（「『【]/;
const PART = /[をはがのにとへも]/;
const SMALL = /[ゃゅょぁぃぅぇぉゎっー]/;
const KANJI = /[\u4E00-\u9FFF]/;
function phrase(text) {
  let o = "";
  const chars = [...text];
  let run = 0; // 直前の改行許可位置からの文字数
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i], n = chars[i + 1], n2 = chars[i + 2];
    o += c; run++;
    if (!n) continue;
    if (/\s/.test(c) || /\s/.test(n)) { run = 0; continue; }
    if (PUNCT.test(n) || SMALL.test(n)) continue;
    let brk = false;
    if (PUNCT.test(c)) brk = true;                                        // 読点・句点の後
    else if (!HIRA.test(n)) {                                             // 次が漢字/カナ/英数
      if (HIRA.test(c) && run >= (PART.test(c) ? 3 : 4)) brk = !(/[おご]/.test(c) && KANJI.test(n)); // お部屋・ご契約は分けない
      else if (OPEN.test(n) && run >= 3) brk = true;
    } else {                                                              // 次がひらがな
      // 助詞の後でも、次がひらがなのときは切らない。
      // 「伝わりに|くい」「として」のように語の途中で切れてしまうため。
      // 行が収まらないときは CSS の overflow-wrap:anywhere が受け持つ。
      if ((n === "お" || n === "ご") && HIRA.test(c) && n2 && KANJI.test(n2) && run >= 2) brk = true; // 「の|お部屋」
    }
    if (brk) { o += "<wbr>"; run = 0; }
  }
  return o;
}
function phraseBreak(html) {
  const bs = html.indexOf("<body"), be = html.lastIndexOf("</body>");
  if (bs < 0) return html;
  let body = html.slice(bs, be);
  // svg / script / style と、LINEボタンのラベルは触らない
  // （ボタンは white-space:nowrap だが、<wbr> があると Chromium がそこで折り返す）
  const parts = body.split(/(<a class="btn-line"[\s\S]*?<\/a>|<svg[\s\S]*?<\/svg>|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/);
  body = parts.map((seg, i) => (i % 2 ? seg : seg.replace(/>([^<]+)</g, (m, t) => ">" + phrase(t) + "<"))).join("");
  return html.slice(0, bs) + body + html.slice(be);
}

function out(path, html) {
  html = phraseBreak(html);
  const file = join(DIST, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

// --- 記事（content/articles/*.md）を読み込む ---
function parseFrontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error("frontmatter がありません");
  const data = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    data[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
  }
  return { data, body: m[2] };
}

const articleDir = "content/articles";
const articles = readdirSync(articleDir)
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const { data, body } = parseFrontmatter(readFileSync(join(articleDir, f), "utf8"));
    const slug = data.slug || f.replace(/\.md$/, "");
    if (data.draft === "true") return null;
    return { ...data, slug, html: marked.parse(body), url: `/articles/${slug}/` };
  })
  .filter(Boolean)
  .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

// --- 固定ページ ---
const pages = [
  { src: "src/pages/index.html", path: "index.html", url: "/", title: site.homeTitle, description: site.description, home: true },
  { src: "src/pages/terms.html", path: "termsandprivacy/index.html", url: "/termsandprivacy/", title: `利用規約・個人情報保護方針｜${site.name}`, description: `${site.name}の利用規約と個人情報保護方針です。` },
];

for (const p of pages) {
  let body = readFileSync(p.src, "utf8");
  body = body.replace("<!--ARTICLE_LIST-->", articleIndexBody(articles.slice(0, 6), true));
  out(p.path, layout({ ...p, body }));
}

// --- 記事ページ ---
for (const a of articles) {
  out(`articles/${a.slug}/index.html`, layout({
    title: `${a.title}｜${site.name}`,
    description: a.description,
    url: a.url,
    type: "article",
    article: a,
    body: articleBody(a),
  }));
}
out("articles/index.html", layout({
  title: `お部屋探しガイド｜${site.name}`,
  description: "内見なしでの部屋探し、上京の部屋探しに役立つ記事の一覧です。",
  url: "/articles/",
  body: `<main class="wrap article-index"><h1>お部屋探しガイド</h1><p class="lead">内見に行けない人のための、部屋探しの知識をまとめています。</p>${articleIndexBody(articles, false)}</main>`,
}));

// --- 404 ---
out("404.html", layout({
  title: `ページが見つかりません｜${site.name}`,
  description: "",
  url: "/404.html",
  noindex: true,
  body: `<main class="wrap notfound"><h1>ページが見つかりません</h1><p>URLが変わったか、削除された可能性があります。</p><p><a class="btn-line" href="/">トップページへ</a></p></main>`,
}));

// --- sitemap / robots ---
const urls = ["/", "/articles/", ...articles.map((a) => a.url), "/termsandprivacy/"];
out("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${site.origin}${u}</loc></url>`).join("\n")}
</urlset>
`);
out("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${site.origin}/sitemap.xml\n`);

// --- 静的ファイル ---
if (existsSync("public")) cpSync("public", DIST, { recursive: true });

console.log(`built: ${pages.length} pages, ${articles.length} articles`);
