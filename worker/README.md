# タイパ賃貸 LINEボット（Cloudflare Worker）

LINE公式アカウントの自動応答とリッチメニューを、管理画面ではなくコードで管理するためのWorker。

返信文を直したいときは `src/messages.js` だけを編集してデプロイする。
リッチメニューの構成を変えたいときは `src/richmenu.js` と画像（`public/line/richmenu.png`）を直す。

## 仕組み

```
LINE ──POST /webhook──> Worker ──Messaging API──> LINE
```

- キーワードは**完全一致**のときだけ返信する。一致しなければ何もしないので、
  普通の会話は今まで通り宅地建物取引士が手動チャットで返せる。
- 友だち追加時はあいさつメッセージを送る。
- リッチメニューは `POST /admin/richmenu` を叩くと作り直して全員に適用される。

## 初回セットアップ

### 1. Messaging APIを有効にする

LINE Official Account Manager → 設定 → Messaging API → 「Messaging APIを利用する」。
LINE Developersのチャネルができるので、そこで次の2つを取得する。

- **チャネルシークレット**（Basic settings）
- **チャネルアクセストークン（長期）**（Messaging API settings → Issue）

### 2. デプロイ

```bash
cd worker
npx wrangler login          # 初回のみ
npx wrangler deploy
```

デプロイすると `https://taipachintai-line.<サブドメイン>.workers.dev` が発行される。

### 3. シークレットを登録

値はターミナルで対話的に入力する。gitにもコードにも残らない。

```bash
npx wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
npx wrangler secret put LINE_CHANNEL_SECRET
npx wrangler secret put ADMIN_KEY      # 自分で決めた長いランダム文字列
```

### 4. Webhookを登録

LINE Developers → Messaging API settings → Webhook URL に
`https://taipachintai-line.<サブドメイン>.workers.dev/webhook` を設定し、
「Use webhook」をオンにして「Verify」が成功することを確認する。

### 5. 管理画面側の自動応答を止める

**ここを忘れると返信が二重になる。**

LINE Official Account Manager → 設定 → 応答設定 →
応答方法を「手動チャット」だけにする（応答メッセージを含まない選択肢）。
あいさつメッセージもWorker側が送るのでオフにする。

### 6. リッチメニューを適用

```bash
curl -X POST "https://taipachintai-line.<サブドメイン>.workers.dev/admin/richmenu?key=<ADMIN_KEY>"
```

画像は `https://taipachintai.com/line/richmenu.png` を読みに行くので、
サイト側が先にデプロイされている必要がある。

## 日常の変更

```bash
node worker/validate.js     # 文字数・キーワード重複・タップ領域をチェック
cd worker && npx wrangler deploy
```

リッチメニューの画像や領域を変えたときだけ、デプロイ後に手順6をもう一度叩く。

## 注意

- 管理画面で作った既存のリッチメニューは、このWorkerからは消さない
  （`name` が `taipachintai-main` のものだけを作り直す）。
  両方が有効だとどちらが出るか読めないので、切り替えたら管理画面側は表示期間を終了させておく。
- テキストは1吹き出し5,000文字まで、1回の応答で5吹き出しまで。
  管理画面の500文字制限より緩いので、返信を分割する必要は薄い。
- `POST /admin/richmenu` は `?key=` が一致しないと403。キーは推測されない長さにすること。
