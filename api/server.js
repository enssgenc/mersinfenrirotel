import { createHash, randomUUID } from "node:crypto";
import http from "node:http";

const PORT = Number(process.env.PORT || 3000);
const PIXEL_ID = process.env.META_PIXEL_ID || "988957093495648";
const TOKEN = process.env.META_CAPI_ACCESS_TOKEN || "";
const TEST_CODE = process.env.META_CAPI_TEST_EVENT_CODE || "";
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ||
  "https://mersinfermirotel.com,https://www.mersinfermirotel.com,https://mersinfenrirotel.com,https://www.mersinfenrirotel.com"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v22.0";
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events`;

const ALLOWED_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "Contact",
  "Lead",
  "Schedule",
  "SubmitApplication",
  "CompleteRegistration",
  "Search",
]);

const sha256 = (s) =>
  createHash("sha256").update(String(s).trim().toLowerCase()).digest("hex");

const normPhone = (p) => {
  const digits = String(p).replace(/\D/g, "");
  return digits.startsWith("0") ? "90" + digits.slice(1) : digits;
};

const readJson = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > 64 * 1024) {
        reject(Object.assign(new Error("payload too large"), { code: 413 }));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      try {
        const body = Buffer.concat(chunks).toString("utf8") || "{}";
        resolve(JSON.parse(body));
      } catch (e) {
        reject(Object.assign(new Error("invalid json"), { code: 400 }));
      }
    });
    req.on("error", reject);
  });

const cors = (req, res) => {
  const origin = req.headers.origin || "";
  const ok = ALLOWED_ORIGINS.includes(origin);
  if (ok) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "600");
  return ok;
};

const json = (res, code, obj) => {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(obj));
};

const clientIp = (req) => {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return String(xff).split(",")[0].trim();
  return req.socket.remoteAddress || "";
};

const buildUserData = (req, body) => {
  const ud = {};
  const u = body.user_data || {};
  if (u.email) ud.em = [sha256(u.email)];
  if (u.phone) ud.ph = [sha256(normPhone(u.phone))];
  if (u.external_id) ud.external_id = [sha256(u.external_id)];
  if (u.fbc) ud.fbc = u.fbc;
  if (u.fbp) ud.fbp = u.fbp;
  const ua = req.headers["user-agent"];
  if (ua) ud.client_user_agent = ua;
  const ip = clientIp(req);
  if (ip) ud.client_ip_address = ip;
  return ud;
};

const handleTrack = async (req, res) => {
  if (!TOKEN) return json(res, 503, { error: "capi not configured" });
  const body = await readJson(req);
  const eventName = String(body.event_name || "");
  if (!ALLOWED_EVENTS.has(eventName))
    return json(res, 400, { error: "event_name not allowed" });

  const eventId = String(body.event_id || randomUUID());
  const eventTime = Math.floor(Date.now() / 1000);
  const eventSourceUrl =
    String(body.event_source_url || req.headers.referer || "").slice(0, 2048) ||
    "https://mersinfenrirotel.com/";

  const payload = {
    data: [
      {
        event_name: eventName,
        event_id: eventId,
        event_time: eventTime,
        event_source_url: eventSourceUrl,
        action_source: "website",
        user_data: buildUserData(req, body),
        custom_data: body.custom_data || {},
      },
    ],
    access_token: TOKEN,
  };
  if (TEST_CODE) payload.test_event_code = TEST_CODE;

  try {
    const r = await fetch(GRAPH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return json(res, 502, { ok: false, status: r.status, meta: data });
    }
    return json(res, 200, {
      ok: true,
      event_id: eventId,
      events_received: data.events_received,
      fbtrace_id: data.fbtrace_id,
    });
  } catch (e) {
    return json(res, 502, { ok: false, error: String(e?.message || e) });
  }
};

const server = http.createServer(async (req, res) => {
  const allowed = cors(req, res);

  if (req.method === "OPTIONS") {
    res.statusCode = allowed ? 204 : 403;
    return res.end();
  }

  if (req.method === "GET" && req.url === "/healthz") {
    return json(res, 200, {
      ok: true,
      pixel: PIXEL_ID,
      capi_configured: Boolean(TOKEN),
      version: GRAPH_VERSION,
    });
  }

  if (req.method === "GET" && (req.url === "/" || req.url === "/api")) {
    return json(res, 200, { service: "mersinfenrirotel-api", status: "ok" });
  }

  if (req.method === "POST" && (req.url === "/api/track" || req.url === "/track")) {
    if (!allowed) return json(res, 403, { error: "origin not allowed" });
    try {
      return await handleTrack(req, res);
    } catch (e) {
      const code = e.code === 400 || e.code === 413 ? e.code : 500;
      return json(res, code, { error: e.message || "server error" });
    }
  }

  return json(res, 404, { error: "not found" });
});

server.listen(PORT, () => {
  console.log(
    `[capi] listening on :${PORT} | pixel=${PIXEL_ID} | configured=${Boolean(TOKEN)}`
  );
});

const shutdown = () => server.close(() => process.exit(0));
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
