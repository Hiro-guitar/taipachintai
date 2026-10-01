// 記事の文体チェック。content/STYLE.md の基準を機械的に見る。
// 使い方: node tools/style-check.js [記事のパス...]
//         引数なしなら content/articles/*.md を全部見る
//
// 判定はあくまで目安。直すかどうかは読んで決める。
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "content/articles";
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(DIR).filter((f) => f.endsWith(".md")).map((f) => join(DIR, f));

// --- 検出したい言い回し -------------------------------------------------
const NG = [
  [/することができ(ます|る)/g, "「〜することができます」→「〜できます」"],
  [/を行(い|う|います)/g, "「〜を行います」→「〜します」"],
  [/において|における/g, "「〜において」→「〜では」"],
  [/させていただ(き|く)/g, "「させていただく」→「します」"],
  [/という形(に|で)/g, "「という形になっています」→「です」"],
  [/ではないでしょうか/g, "読者の気持ちの代弁。言い切るか、書かない"],
  [/と言えるでしょう|と考えられます|が望ましいでしょう/g, "逃げの語尾。言い切る"],
  [/一概には言えません|状況に応じて異なります|場合によって異なります/g, "両論併記。判断を書く"],
  [/まさに|過言ではありません/g, "誇張の定型句"],
  [/非常に|極めて|しっかりと|大幅に|劇的に/g, "程度副詞。削るか数値にする"],
  [/重要です|効果的です|さまざまな|多様な|最適な/g, "根拠のない評価語"],
  [/が求められています|が推奨されます|が期待されます/g, "主体のない受け身"],
  [/しつこい営業/g, "書かない方針"],
  [/番手/g, "業界用語。使わない"],
  [/—/g, "欧文ダッシュ。読点か文の分割に"],
];

// 文頭の順接接続詞（原則すべて削る）
const CONJ = ["また", "さらに", "そして", "したがって", "そのため", "これにより", "そのうえ", "加えて"];

const KANJI = /[一-鿿]/;
const JA = /[ぁ-ゟァ-ヺ一-鿿]/;

function stripMd(s) {
  return s
    .replace(/^---\n[\s\S]*?\n---\n/, "")       // frontmatter
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^<(table|ol|ul|p|div|figure)[\s\S]*?<\/\1>\s*$/gm, "")  // 生のHTMLブロックは文体の対象外
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")     // リンクはテキストだけ残す
    .replace(/`([^`]*)`/g, "$1");
}

function report(file) {
  const raw = readFileSync(file, "utf8");
  const body = stripMd(raw);
  const lines = body.split("\n");
  const warn = [];
  const note = (msg) => warn.push(msg);

  // --- 見出し ---
  for (const l of lines) {
    const m = l.match(/^(#{2,6})\s+(.*)$/);
    if (!m) continue;
    const [, hashes, text] = m;
    if (hashes.length > 3) note(`見出しが3階層目より深い: ${text}`);
    const n = [...text].length;
    if (n > 25) note(`見出しが長い（${n}字）: ${text}`);
  }

  // --- 本文の段落（見出し・箇条書き・表を除く） ---
  const paras = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p && !/^#{1,6}\s/.test(p) && !/^[-*|>]/.test(p) && !/^\d+\./.test(p));

  const sentences = [];
  const paraSents = []; // 段落ごとの文（文末の連続は段落内だけで見る）
  for (const p of paras) {
    const ss = p.replace(/\n/g, "").split(/(?<=。)/).filter((s) => s.trim());
    paraSents.push(ss);
    if (ss.length > 4) note(`段落が${ss.length}文ある（4文まで）: ${ss[0].slice(0, 28)}…`);
    sentences.push(...ss);
    // 長めの段落に数値も固有名詞らしきカタカナもないと、具体性が薄い
    if (ss.length >= 4 && !/[0-9０-９]/.test(p) && !/[ァ-ヺ]{3,}/.test(p))
      note(`4文あるのに数値も固有名詞もない段落: ${p.slice(0, 28)}…`);
  }

  // --- 一文の長さ ---
  const lens = sentences.map((s) => [...s.replace(/\*\*/g, "")].length);
  const avg = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;
  const longs = sentences.filter((s) => [...s].length > 80);
  const shortRate = lens.filter((n) => n <= 20).length / (lens.length || 1);

  for (const s of longs) note(`一文が長い（${[...s].length}字）: ${s.slice(0, 32)}…`);
  if (avg < 33 || avg > 50) note(`一文の平均が${avg.toFixed(0)}字（目安35〜45字）`);
  // 短い文が多すぎると媒体の落ち着きがなくなり、個人ブログの調子になる
  if (shortRate > 0.15) note(`短い文（20字以下）が${(shortRate * 100).toFixed(0)}%（1割まで。文を刻まない）`);

  // --- 文末の単調さ（段落をまたいだ連続は、間に見出しが入るので数えない） ---
  for (const ss of paraSents) {
    const tail = ss.map((x) => x.trim().replace(/。$/, "").slice(-3));
    let runLen = 1;
    for (let i = 1; i < tail.length; i++) {
      if (tail[i] && tail[i] === tail[i - 1]) {
        if (++runLen === 3) note(`同じ文末が3連続: 「…${tail[i]}。」`);
      } else runLen = 1;
    }
  }

  const h2 = (body.match(/^## /gm) || []).length;

  // --- 文頭の順接接続詞 ---
  const hits = {};
  for (const s of sentences) {
    const head = s.trim();
    for (const c of CONJ) if (head.startsWith(c)) hits[c] = (hits[c] || 0) + 1;
  }
  const conjTotal = Object.values(hits).reduce((a, b) => a + b, 0);
  // 全部削るのではなく、多すぎるときだけ知らせる（h2 1個につき1個が目安）
  if (h2 && conjTotal > h2) note(`文頭の順接接続詞が多い ${conjTotal}個／h2が${h2}個: ${Object.entries(hits).map(([k, v]) => `${k}×${v}`).join(" ")}`);

  // --- 禁止表現 ---
  for (const [re, msg] of NG) {
    const m = body.match(re);
    if (m) note(`${msg}  [${[...new Set(m)].join("／")}  ${m.length}件]`);
  }

  // --- 漢字比率（見出し・箇条書き・表は数えない。項目名は専門用語そのもので、
  //     ひらがなにしようがないため。地の文の読みやすさだけを見る） ---
  const ja = [...paras.join("\n")].filter((c) => JA.test(c));
  const kanjiRate = ja.filter((c) => KANJI.test(c)).length / (ja.length || 1);
  if (kanjiRate > 0.38) note(`漢字比率 ${(kanjiRate * 100).toFixed(0)}%（38%まで。ひらがなを増やす）`);

  // --- 太字（箇条書きの項目名「- **〇〇**：」は数えない） ---
  const bold = body
    .split("\n")
    .filter((l) => !/^\s*[-*]\s+\*\*/.test(l))
    .join("\n")
    .match(/\*\*/g);
  const boldN = (bold || []).length / 2;
  if (h2 && boldN > h2) note(`文中の太字が多い（${boldN}箇所／h2が${h2}個。1セクション1箇所が目安）`);

  return { file, warn, stats: { 文数: sentences.length, 平均字数: avg.toFixed(0), 短文率: `${(shortRate * 100).toFixed(0)}%`, 本文漢字率: `${(kanjiRate * 100).toFixed(0)}%`, 見出しh2: h2, 太字: boldN } };
}

let total = 0;
for (const f of files) {
  const r = report(f);
  total += r.warn.length;
  console.log(`\n■ ${r.file}`);
  console.log("  " + Object.entries(r.stats).map(([k, v]) => `${k}:${v}`).join("  "));
  if (!r.warn.length) console.log("  指摘なし");
  else r.warn.forEach((w) => console.log("  - " + w));
}
console.log(`\n合計 ${total}件。content/STYLE.md の基準にもとづく目安です。`);
