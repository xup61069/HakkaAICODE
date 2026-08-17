// 多 KEY 輪換版 zen-header-injector：零依賴、可直接取代 server.js 使用。
//
// 行為與原版完全相容，另外支援多把 API key 的自動輪換：
//   - 某把 key 回 429（或 401）時，自動切到下一把 key
//   - 被 429 的 key 進入冷卻退避（60s 起跳、逐次加倍、最多 30 分鐘）
//   - 設定檔優先於環境變數；沒有設定任何 key 時，行為與原版一樣
//     （沿用客戶端送來的 Authorization，只補兩個標頭）
//
// 環境變數（新增）：
//   ZEN_INJECTOR_KEYS_FILE : key 清單檔路徑，一行一把，支援 # 註解
//   ZEN_INJECTOR_KEYS      : 逗號分隔的 key 清單（inline 用，優先度低於檔案）
//   ZEN_INJECTOR_ROTATE_ON : 觸發輪換的狀態碼，預設 "429,401"
//   ZEN_INJECTOR_DEBUG     : 設為 1 時，回應會帶 x-zen-key-index 方便除錯

const http = require("http");
const https = require("https");
const fs = require("fs");
const os = require("os");
const path = require("path");

const LISTEN_PORT = parseInt(process.env.ZEN_INJECTOR_PORT || "15722", 10);
const UPSTREAM_HOST = process.env.ZEN_INJECTOR_UPSTREAM_HOST || "opencode.ai";
const UPSTREAM_BASE = process.env.ZEN_INJECTOR_UPSTREAM_BASE || "/zen/v1";
const HEADER_NAME = process.env.ZEN_INJECTOR_HEADER_NAME || "x-opencode-client";
const HEADER_VALUE = process.env.ZEN_INJECTOR_HEADER_VALUE || "terminal";
const USER_AGENT = process.env.ZEN_INJECTOR_USER_AGENT || "opencode";
const ROTATE_ON = (process.env.ZEN_INJECTOR_ROTATE_ON || "429,401")
  .split(",")
  .map((s) => parseInt(s.trim(), 10))
  .filter((n) => !isNaN(n));
const DEBUG = process.env.ZEN_INJECTOR_DEBUG === "1";

const LOG = process.env.ZEN_INJECTOR_LOG || path.join(__dirname, "injector.log");
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(LOG, line); } catch (_) {}
}

// ---- 載入 key 清單 ----
const DEFAULT_KEYS_FILE = path.join(os.homedir(), "HakkaAICODE", "zen-keys.txt");

function loadKeys() {
  const keysFile = process.env.ZEN_INJECTOR_KEYS_FILE || DEFAULT_KEYS_FILE;
  if (fs.existsSync(keysFile)) {
    return fs
      .readFileSync(keysFile, "utf8")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
  }
  return (process.env.ZEN_INJECTOR_KEYS || "")
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k);
}

const KEYS = loadKeys();
const KEY_COUNT = KEYS.length;

// 每把 key 的狀態：冷卻退避 + 連續 429 次數
const keysState = KEYS.map(() => ({ cooldownUntil: 0, consecutive429: 0 }));
let currentIndex = 0;

function now() {
  return Date.now();
}

function isCooling(idx) {
  return now() < keysState[idx].cooldownUntil;
}

// 從 currentIndex 出發，找下一把「不在冷卻」的 key
function nextIndexFrom(start) {
  if (KEY_COUNT === 0) return -1;
  for (let i = 1; i <= KEY_COUNT; i++) {
    const idx = (start + i) % KEY_COUNT;
    if (!isCooling(idx)) return idx;
  }
  return -1;
}

// 每筆請求要用的 key。全部都在冷卻時，退回冷卻最早結束的那把，
// 上游還是會回 429，但至少請求持續送出、不會整台卡住。
function pickKeyIndex() {
  if (KEY_COUNT === 0) return -1;
  if (!isCooling(currentIndex)) return currentIndex;
  const next = nextIndexFrom(currentIndex);
  if (next !== -1) {
    currentIndex = next;
    return next;
  }
  let earliest = 0;
  for (let i = 1; i < KEY_COUNT; i++) {
    if (keysState[i].cooldownUntil < keysState[earliest].cooldownUntil) earliest = i;
  }
  currentIndex = earliest;
  return earliest;
}

// 某把 key 被 429 / 401 打到：標記冷卻；若它正是現在指到的 key，就往前切
function markCooldown(idx, status) {
  const st = keysState[idx];
  st.consecutive429 += 1;
  const backoff = Math.min(60_000 * Math.pow(2, st.consecutive429 - 1), 30 * 60_000);
  st.cooldownUntil = now() + backoff;
  if (idx === currentIndex) {
    const next = nextIndexFrom(idx);
    if (next !== -1) currentIndex = next;
  }
  log(
    `key#${idx + 1} got ${status}, rotating (cooldown ${Math.round(backoff / 1000)}s, ` +
      `total keys ${KEY_COUNT}, current key#${currentIndex + 1})`
  );
}

if (KEY_COUNT > 0) {
  log(`loaded ${KEY_COUNT} api keys for rotation (rotate on: ${ROTATE_ON.join(",")})`);
} else {
  log("no api keys configured, running in plain passthrough mode");
}

const HOP_BY_HOP = new Set([
  "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
  "te", "trailer", "transfer-encoding", "upgrade", "host",
]);

const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://localhost");
  let targetPath = u.pathname;
  if (targetPath.startsWith("/v1")) targetPath = targetPath.slice(3);
  const targetUrl = `https://${UPSTREAM_HOST}${UPSTREAM_BASE}${targetPath}${u.search}`;

  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (HOP_BY_HOP.has(k.toLowerCase())) continue;
    headers[k] = v;
  }
  headers[HEADER_NAME] = HEADER_VALUE;
  headers["user-agent"] = USER_AGENT;

  const keyIndex = pickKeyIndex();
  if (keyIndex !== -1) {
    headers["authorization"] = `Bearer ${KEYS[keyIndex]}`;
    if (DEBUG) res.setHeader("x-zen-key-index", String(keyIndex));
  }

  const upstreamReq = https.request(
    targetUrl,
    { method: req.method, headers },
    (upstreamRes) => {
      if (keyIndex !== -1 && ROTATE_ON.includes(upstreamRes.statusCode)) {
        markCooldown(keyIndex, upstreamRes.statusCode);
      }
      const respHeaders = {};
      for (const [k, v] of Object.entries(upstreamRes.headers)) {
        if (HOP_BY_HOP.has(k.toLowerCase())) continue;
        respHeaders[k] = v;
      }
      res.writeHead(upstreamRes.statusCode, respHeaders);
      upstreamRes.pipe(res);
    }
  );
  upstreamReq.on("error", (err) => {
    log(`ERROR ${req.method} ${targetUrl} -> ${err.message}`);
    if (!res.headersSent) res.writeHead(502, { "content-type": "text/plain" });
    res.end(`upstream error: ${err.message}`);
  });
  req.on("aborted", () => upstreamReq.destroy());
  req.pipe(upstreamReq);
});

function shutdown() {
  log("shutting down");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.listen(LISTEN_PORT, "127.0.0.1", () => {
  log(`zen multikey injector listening on 127.0.0.1:${LISTEN_PORT} -> https://${UPSTREAM_HOST}${UPSTREAM_BASE} (${HEADER_NAME}: ${HEADER_VALUE})`);
});
