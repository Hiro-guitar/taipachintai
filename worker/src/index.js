// タイパ賃貸 LINEボット（Cloudflare Worker）
//
// ルート:
//   POST /webhook          LINEからのイベント受信（署名検証あり）
//   POST /admin/richmenu   リッチメニューを作り直して全員に適用（ADMIN_KEY必須）
//   GET  /admin/richmenu   現在登録されているリッチメニューの一覧（ADMIN_KEY必須）
//   GET  /health           疎通確認
//
// Secrets（wrangler secret put で設定。コードにもgitにも値は置かない）:
//   LINE_CHANNEL_ACCESS_TOKEN
//   LINE_CHANNEL_SECRET
//   ADMIN_KEY

import { GREETING, findReply } from "./messages.js";
import { richMenu, RICHMENU_NAME, RICHMENU_IMAGE_URL } from "./richmenu.js";

const API = "https://api.line.me";
const API_DATA = "https://api-data.line.me";

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

// ---- LINE API ----------------------------------------------------------

function lineHeaders(env) {
  return {
    "content-type": "application/json",
    authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
  };
}

async function lineFetch(env, path, init = {}, base = API) {
  const res = await fetch(base + path, {
    ...init,
    headers: { ...lineHeaders(env), ...(init.headers || {}) },
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`LINE ${init.method || "GET"} ${path} -> ${res.status} ${body}`);
  return body ? JSON.parse(body) : {};
}

async function reply(env, replyToken, texts) {
  await lineFetch(env, "/v2/bot/message/reply", {
    method: "POST",
    body: JSON.stringify({
      replyToken,
      messages: texts.slice(0, 5).map((text) => ({ type: "text", text })),
    }),
  });
}

async function getProfile(env, userId) {
  try {
    return await lineFetch(env, `/v2/bot/profile/${userId}`);
  } catch {
    return {};
  }
}

// ---- 署名検証 ----------------------------------------------------------

function bytesToBase64(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

// タイミング差で内容を推測されないよう、長さを固定して全バイト比較する
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifySignature(env, rawBody, signature) {
  if (!signature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.LINE_CHANNEL_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  return timingSafeEqual(bytesToBase64(new Uint8Array(mac)), signature);
}

// ---- イベント処理 ------------------------------------------------------

async function handleEvent(env, event) {
  if (event.type === "follow") {
    const profile = await getProfile(env, event.source?.userId);
    const name = profile.displayName || "";
    // 表示名が取れないときは呼びかけごと落とす（「さん、」だけ残らないように）
    const texts = GREETING.map((t) =>
      name ? t.replaceAll("{displayName}", name) : t.replace(/^\{displayName\}さん、/, "")
    );
    await reply(env, event.replyToken, texts);
    return;
  }

  if (event.type === "message" && event.message?.type === "text") {
    const hit = findReply(event.message.text);
    // 完全一致しなければ何もしない。手動チャットで宅建士が返す。
    if (hit) await reply(env, event.replyToken, hit.messages);
  }
}

// ---- リッチメニュー構築 ------------------------------------------------

async function rebuildRichMenu(env) {
  const log = [];

  // 同じ名前の古いものだけ消す（管理画面で作ったものには触らない）
  const { richmenus = [] } = await lineFetch(env, "/v2/bot/richmenu/list");
  for (const m of richmenus) {
    if (m.name === RICHMENU_NAME) {
      await lineFetch(env, `/v2/bot/richmenu/${m.richMenuId}`, { method: "DELETE" });
      log.push(`deleted ${m.richMenuId}`);
    }
  }

  const { richMenuId } = await lineFetch(env, "/v2/bot/richmenu", {
    method: "POST",
    body: JSON.stringify(richMenu),
  });
  log.push(`created ${richMenuId}`);

  const img = await fetch(RICHMENU_IMAGE_URL, { cf: { cacheTtl: 0 } });
  if (!img.ok) throw new Error(`image fetch failed: ${img.status} ${RICHMENU_IMAGE_URL}`);
  const bytes = await img.arrayBuffer();

  const up = await fetch(`${API_DATA}/v2/bot/richmenu/${richMenuId}/content`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
      "content-type": "image/png",
    },
    body: bytes,
  });
  if (!up.ok) throw new Error(`image upload failed: ${up.status} ${await up.text()}`);
  log.push(`uploaded ${bytes.byteLength} bytes`);

  await lineFetch(env, `/v2/bot/user/all/richmenu/${richMenuId}`, { method: "POST" });
  log.push("set as default");

  return { richMenuId, log };
}

// ---- ルーティング ------------------------------------------------------

function authorized(request, env) {
  const key = new URL(request.url).searchParams.get("key");
  return Boolean(env.ADMIN_KEY) && key === env.ADMIN_KEY;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/health") return json({ ok: true });

    if (url.pathname === "/webhook" && request.method === "POST") {
      const raw = await request.text();
      const ok = await verifySignature(env, raw, request.headers.get("x-line-signature"));
      if (!ok) return new Response("bad signature", { status: 401 });

      const { events = [] } = JSON.parse(raw);
      // LINEには先に200を返し、処理は裏で続ける（返信が遅れても再送されないように）
      ctx.waitUntil(
        Promise.all(
          events.map((e) =>
            handleEvent(env, e).catch((err) => console.error("event failed", e.type, err.message))
          )
        )
      );
      return new Response("ok");
    }

    if (url.pathname === "/admin/richmenu") {
      if (!authorized(request, env)) return new Response("forbidden", { status: 403 });
      try {
        if (request.method === "POST") return json(await rebuildRichMenu(env));
        return json(await lineFetch(env, "/v2/bot/richmenu/list"));
      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    return new Response("not found", { status: 404 });
  },
};
