// 返信定義の簡易チェック。`node worker/validate.js` で実行する。
import { REPLIES, GREETING, findReply } from "./src/messages.js";
import { richMenu } from "./src/richmenu.js";

const errors = [];
const MAX_TEXT = 5000; // LINE Messaging API のテキスト上限
const MAX_BUBBLES = 5; // 1回の応答で送れる吹き出し数

const seen = new Map();
for (const r of [...REPLIES, { id: "__greeting", keywords: [], messages: GREETING }]) {
  if (r.messages.length > MAX_BUBBLES) errors.push(`${r.id}: 吹き出しが${r.messages.length}個（上限${MAX_BUBBLES}）`);
  r.messages.forEach((m, i) => {
    if (!m.trim()) errors.push(`${r.id}[${i}]: 空`);
    if (m.length > MAX_TEXT) errors.push(`${r.id}[${i}]: ${m.length}文字（上限${MAX_TEXT}）`);
  });
  for (const k of r.keywords) {
    if (seen.has(k)) errors.push(`キーワード重複: "${k}" (${seen.get(k)} と ${r.id})`);
    seen.set(k, r.id);
    if (k.length > 30) errors.push(`${r.id}: キーワード "${k}" が30文字超`);
    if (k !== k.trim()) errors.push(`${r.id}: キーワード "${k}" の前後に空白`);
  }
}

// リッチメニューのタップ領域が画像を隙間なく、はみ出さずに覆っているか
const { width, height } = richMenu.size;
let covered = 0;
for (const a of richMenu.areas) {
  const { x, y, width: w, height: h } = a.bounds;
  if (x < 0 || y < 0 || x + w > width || y + h > height) errors.push(`領域がはみ出している: ${JSON.stringify(a.bounds)}`);
  covered += w * h;
}
if (covered !== width * height) errors.push(`領域の合計が画像と一致しない: ${covered} != ${width * height}`);

// リッチメニューが送るテキストに、必ず対応する応答があること
for (const a of richMenu.areas) {
  const t = a.action.text;
  if (!findReply(t)) errors.push(`リッチメニューの "${t}" に対応する応答がない`);
}

if (errors.length) {
  console.error("NG:\n" + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`OK: 応答${REPLIES.length}件 / キーワード${seen.size}個 / リッチメニュー領域${richMenu.areas.length}個`);
