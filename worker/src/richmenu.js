// リッチメニューの定義。画像は 2500 x 1686（大サイズ）。
// タップ領域は「上に横長1つ＋下に3つ」。座標は画像のピクセルと一致させる。

export const RICHMENU_NAME = "taipachintai-main";
export const RICHMENU_IMAGE_URL = "https://taipachintai.com/line/richmenu.png";

const W = 2500;
const H = 1686;
const TOP_H = 843;
const COL = Math.floor(W / 3); // 833

export const richMenu = {
  size: { width: W, height: H },
  selected: false, // デフォルトは閉じた状態（キーボードを塞がない）
  name: RICHMENU_NAME,
  chatBarText: "メニュー",
  areas: [
    {
      bounds: { x: 0, y: 0, width: W, height: TOP_H },
      action: { type: "message", text: "物件URLを送る" },
    },
    {
      bounds: { x: 0, y: TOP_H, width: COL, height: H - TOP_H },
      action: { type: "message", text: "仲介手数料" },
    },
    {
      bounds: { x: COL, y: TOP_H, width: W - COL * 2, height: H - TOP_H },
      action: { type: "message", text: "利用の流れ" },
    },
    {
      bounds: { x: W - COL, y: TOP_H, width: COL, height: H - TOP_H },
      action: { type: "message", text: "よくある質問" },
    },
  ],
};
