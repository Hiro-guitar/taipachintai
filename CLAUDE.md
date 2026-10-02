# タイパ賃貸

内見なしの賃貸仲介サービス taipachintai.com のサイトと、LINE公式アカウントのボット。
運営は合同会社えほうまき（宅建士ひとり）。

## 記事を書く・直すとき

**`content/STYLE.md` を必ず先に読む。** 文体のルール、禁止する言い回し、
これまでに間違えた事実関係が書いてある。

書いたあとは機械チェックをかける。

```bash
npm run style        # 文体チェック（全記事）
npm run style -- content/articles/xxx.md   # 1記事だけ
```

指摘は目安なので、直すかどうかは読んで決める。

## 構成

```
content/articles/*.md   記事（frontmatter + 本文）
content/STYLE.md        文体ガイド
public/img/articles/    記事のアイキャッチ（<slug>.svg と、OGP用の <slug>.png）
src/pages/*.html        固定ページ
src/layout.js           共通レイアウト、記事下のCTA、JSON-LD
public/                 style.css と静的ファイル。そのまま dist/ にコピーされる
build.js                ビルド。dist/ を作る
tools/style-check.js    文体チェック
worker/                 LINEボット（Cloudflare Worker）
```

## ビルドとデプロイ

```bash
npm run build        # dist/ を作る
npm run style        # 文体チェック
node worker/validate.js   # LINEの返信文のチェック
```

サイトもWorkerも、GitHub の main に push すると Cloudflare が自動でデプロイする。

build.js は出力に閉じていないマークダウンの太字（`**`）が残っているとビルドを失敗させる。
日本語では「できます。\*\*」のように句読点の後ろに閉じ記号を置くと閉じられないので、句点の前に置く。

## LINEボット

返信文は `worker/src/messages.js` だけを直す。キーワードは完全一致。
リッチメニューの構成は `worker/src/richmenu.js`、画像は `public/line/richmenu.png`。
詳しくは `worker/README.md`。

## 方針として決まっていること

- 顔写真と担当者紹介は出さない
- 「しつこい営業はしません」とは書かない
- 部屋探しは代行しない。自分で見つけた部屋の手続きを代行するサービス
- 物件ごとの初期費用の概算は、申込を検討する段階まで出さない
- 宅建士であることを押し出しすぎない
</content>
