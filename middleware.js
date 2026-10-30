import { createHmac, timingSafeEqual } from "node:crypto";
import { next } from "@vercel/functions";

const COOKIE = "andrea_diary_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function sign(value, secret) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function validSession(request, secret) {
  const cookieHeader = request.headers.get("cookie") || "";
  const item = cookieHeader.split(";").map(v => v.trim()).find(v => v.startsWith(COOKIE + "="));
  if (!item) return false;
  const token = decodeURIComponent(item.slice(COOKIE.length + 1));
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(sign(payload, secret), signature)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number.isFinite(data.exp) && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function loginPage(error = "") {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f8edf0"><title>El diario mágico de Andrea</title><style>
  *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 20% 15%,#f5dfe8,transparent 35%),radial-gradient(circle at 85% 80%,#e7dff2,transparent 35%),#f8f1ed;color:#554354;font-family:Georgia,serif}
  .panel{width:min(100%,430px);padding:42px 34px;background:#fffaf4;border:1px solid #e7d4c8;box-shadow:0 18px 60px #78607822;border-radius:8px;text-align:center;position:relative}
  .panel:before{content:"";position:absolute;inset:12px;border:1px solid #ead9c8;pointer-events:none}
  .stars{color:#c69d61;letter-spacing:12px;font-size:20px}.kicker{font:10px Arial,sans-serif;letter-spacing:3px;color:#a77b91;margin:18px 0}
  h1{font-size:36px;font-weight:normal;line-height:1.1;margin:10px 0;color:#76576a}h1 em{color:#c47e9d}
  p{font-size:14px;line-height:1.6;color:#806f7c;margin:18px auto 24px;max-width:290px}
  form{position:relative;z-index:1}input{width:100%;padding:14px 15px;border:1px solid #d9c4cf;border-radius:5px;background:#fff;font-size:16px;color:#51414e;outline:none}input:focus{border-color:#bd83a0;box-shadow:0 0 0 3px #bd83a022}
  button{width:100%;margin-top:12px;padding:14px;border:0;border-radius:5px;background:#87647d;color:white;font-size:14px;letter-spacing:.5px;cursor:pointer}button:hover{background:#72536a}
  .error{color:#a33d58;font:13px Arial,sans-serif;margin:12px 0 0;min-height:18px}
  .foot{font:10px Arial,sans-serif;letter-spacing:1px;color:#b29aa7;margin-top:25px}
  </style></head><body><main class="panel"><div class="stars">✧ ♡ ✧</div><div class="kicker">UN LIBRO SOLO PARA TI</div><h1>El diario<br><em>mágico de Andrea</em></h1><p>Hay una pequeña aventura esperándote. Escribe la clave para abrir estas páginas.</p><form method="POST" action="/__login"><input name="password" type="password" placeholder="Escribe la contraseña" autocomplete="current-password" required autofocus><button type="submit">Abrir mi diario ✧</button><div class="error" role="alert">${error}</div></form><div class="foot">BARCELONA · FEBRERO 2027</div></main></body></html>`;
}

export const config = { runtime: "nodejs", matcher: ["/(.*)"] };

export default async function middleware(request) {
  const url = new URL(request.url);
  const password = process.env.DIARY_PASSWORD;
  const secret = process.env.DIARY_SESSION_SECRET;

  if (!password || !secret) {
    return new Response("El acceso privado aún no está configurado.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" }
    });
  }

  if (url.pathname === "/__login" && request.method === "POST") {
    const form = await request.formData();
    const submitted = String(form.get("password") || "");
    if (!safeEqual(submitted, password)) {
      return new Response(loginPage("La contraseña no es correcta. Inténtalo de nuevo."), {
        status: 401,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
      });
    }
    const payload = Buffer.from(JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS
    })).toString("base64url");
    const token = payload + "." + sign(payload, secret);
    return new Response(null, {
      status: 303,
      headers: {
        "location": "/",
        "set-cookie": `${COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Lax`,
        "cache-control": "no-store"
      }
    });
  }

  if (url.pathname === "/__logout") {
    return new Response(null, {
      status: 303,
      headers: {
        "location": "/",
        "set-cookie": `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
        "cache-control": "no-store"
      }
    });
  }

  if (!validSession(request, secret)) {
    return new Response(loginPage(), {
      status: 401,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
    });
  }

  return next();
}
