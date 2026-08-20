// 多 KEY 輪換版 zen-header-injector：零依賴、可直接取代 server.js 使用。
//
// 行為與原版完全相容，另外支援多把 API key 的自動輪換與熱重載：
//   - 某把 key 回 429（或 401）時，自動切到下一把 key
//   - 被 429 的 key 進入冷卻退避（60s 起跳、逐次加倍、最多 30 分鐘）
//   - 自動偵測金鑰檔案 (zen-keys.txt) 修改時間，修改後自動熱重載，無需重啟服務
//   - 提供健康與狀態檢測端點：GET /__health 或 GET /v1/status
//   - 設定檔優先於環境變數；沒有設定任何 key 時，行為與原版一樣
//     （沿用客戶端送來的 Authorization，只補兩個標頭）
//
// 環境變數：
//   ZEN_INJECTOR_PORT      : 監聽端口，預設 15722
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
  const line = `[${new Date().toISOString()}] ${msg}`;
  try {
    fs.appendFileSync(LOG, line + "\n");
  } catch (_) {}
  if (process.stdout.isTTY || process.env.ZEN_INJECTOR_CONSOLE === "1") {
    console.log(line);
  }
}

// ---- 金鑰載入與熱重載 (Hot-Reload) 機制 ----
const DEFAULT_KEYS_FILE = path.join(os.homedir(), "HakkaAICODE", "zen-keys.txt");
const keysFile = process.env.ZEN_INJECTOR_KEYS_FILE || DEFAULT_KEYS_FILE;

let currentKeys = [];
let keysState = [];
let currentIndex = 0;
let lastKeysMtime = 0;
let totalRequests = 0;
let totalRotations = 0;
const startTime = Date.now();

function maskKey(key) {
  if (!key || key.length < 8) return "********";
  return key.slice(0, 4) + "..." + key.slice(-4);
}

function reloadKeysIfNeeded() {
  try {
    if (fs.existsSync(keysFile)) {
      const stats = fs.statSync(keysFile);
      if (stats.mtimeMs !== lastKeysMtime) {
        lastKeysMtime = stats.mtimeMs;
        const fileContent = fs.readFileSync(keysFile, "utf8");
        const lines = fileContent
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith("#"));

        // 更新 keys 清單並保留仍有效的冷卻狀態
        const newKeys = lines;
        const newStates = newKeys.map((k) => {
          const oldIdx = currentKeys.indexOf(k);
          if (oldIdx !== -1 && keysState[oldIdx]) {
            return keysState[oldIdx];
          }
          return { cooldownUntil: 0, consecutive429: 0 };
        });

        currentKeys = newKeys;
        keysState = newStates;
        if (currentIndex >= currentKeys.length) currentIndex = 0;

        log(`[Hot-Reload] Loaded ${currentKeys.length} API keys from ${keysFile}`);
        return;
      }
    }
  } catch (err) {
    log(`[Hot-Reload] Error reading ${keysFile}: ${err.message}`);
  }

  // 若無檔案但環境變數有設置，且目前尚未載入過
  if (currentKeys.length === 0 && process.env.ZEN_INJECTOR_KEYS) {
    currentKeys = process.env.ZEN_INJECTOR_KEYS.split(",")
      .map((k) => k.trim())
      .filter((k) => k);
    keysState = currentKeys.map(() => ({ cooldownUntil: 0, consecutive429: 0 }));
    if (currentKeys.length > 0) {
      log(`Loaded ${currentKeys.length} API keys from ZEN_INJECTOR_KEYS environment variable`);
    }
  }
}

// 初始載入
reloadKeysIfNeeded();

if (currentKeys.length > 0) {
  log(`Initialized with ${currentKeys.length} API keys (rotate on: ${ROTATE_ON.join(",")})`);
} else {
  log("No API keys configured, running in plain passthrough mode");
}

function now() {
  return Date.now();
}

function isCooling(idx) {
  return now() < keysState[idx].cooldownUntil;
}

function nextIndexFrom(start) {
  const count = currentKeys.length;
  if (count === 0) return -1;
  for (let i = 1; i <= count; i++) {
    const idx = (start + i) % count;
    if (!isCooling(idx)) return idx;
  }
  return -1;
}

function pickKeyIndex() {
  reloadKeysIfNeeded();
  const count = currentKeys.length;
  if (count === 0) return -1;
  if (!isCooling(currentIndex)) return currentIndex;

  const next = nextIndexFrom(currentIndex);
  if (next !== -1) {
    currentIndex = next;
    return next;
  }

  // 全部都在冷卻時，挑冷卻最早結束的那把
  let earliest = 0;
  for (let i = 1; i < count; i++) {
    if (keysState[i].cooldownUntil < keysState[earliest].cooldownUntil) {
      earliest = i;
    }
  }
  currentIndex = earliest;
  return earliest;
}

function markCooldown(idx, status) {
  if (idx < 0 || idx >= keysState.length) return;
  totalRotations++;
  const st = keysState[idx];
  st.consecutive429 += 1;
  const backoff = Math.min(60_000 * Math.pow(2, st.consecutive429 - 1), 30 * 60_000);
  st.cooldownUntil = now() + backoff;

  if (idx === currentIndex) {
    const next = nextIndexFrom(idx);
    if (next !== -1) currentIndex = next;
  }

  log(
    `key#${idx + 1} (${maskKey(currentKeys[idx])}) got HTTP ${status}, cooling for ${Math.round(
      backoff / 1000
    )}s (total: ${currentKeys.length}, next key#${currentIndex + 1})`
  );
}

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
]);

const server = http.createServer((req, res) => {
  totalRequests++;
  const u = new URL(req.url, "http://localhost");

  // ---- 狀態與健康檢查端點 ----
  if (u.pathname === "/__health" || u.pathname === "/v1/status" || u.pathname === "/status") {
    reloadKeysIfNeeded();
    const readyKeys = keysState.filter((_, idx) => !isCooling(idx)).length;
    const coolingKeys = keysState.length - readyKeys;

    const payload = {
      status: "ok",
      uptimeSeconds: Math.floor((now() - startTime) / 1000),
      totalRequests,
      totalRotations,
      keys: {
        total: currentKeys.length,
        ready: readyKeys,
        cooling: coolingKeys,
        currentIndex: currentKeys.length > 0 ? currentIndex + 1 : 0,
        keysFile: fs.existsSync(keysFile) ? keysFile : null,
        details: currentKeys.map((k, idx) => ({
          index: idx + 1,
          maskedKey: maskKey(k),
          isCooling: isCooling(idx),
          coolingRemainingSeconds: isCooling(idx)
            ? Math.max(0, Math.round((keysState[idx].cooldownUntil - now()) / 1000))
            : 0,
          consecutiveErrors: keysState[idx].consecutive429,
        })),
      },
      upstream: `https://${UPSTREAM_HOST}${UPSTREAM_BASE}`,
      injectedHeaders: {
        [HEADER_NAME]: HEADER_VALUE,
        "user-agent": USER_AGENT,
      },
    };

    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(payload, null, 2));
    return;
  }

  // ---- 轉發 Proxy 請求 ----
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
    headers["authorization"] = `Bearer ${currentKeys[keyIndex]}`;
    if (DEBUG) res.setHeader("x-zen-key-index", String(keyIndex + 1));
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
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    }
    res.end(`Upstream proxy error: ${err.message}`);
  });

  req.on("error", (err) => {
    log(`Client request error: ${err.message}`);
    upstreamReq.destroy();
  });

  req.on("aborted", () => {
    upstreamReq.destroy();
  });

  req.pipe(upstreamReq);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    log(`[FATAL] Port ${LISTEN_PORT} is already in use by another process.`);
    console.error(`\n[錯誤] 端口 ${LISTEN_PORT} 已被其他程式佔用。`);
    console.error(`若已有正在運行的 injector，請先停止它或指定其他端口：`);
    console.error(`  - 查看佔用: Get-NetTCPConnection -LocalPort ${LISTEN_PORT}`);
    console.error(`  - 指定端口: $env:ZEN_INJECTOR_PORT=15723; node server-multikey.js\n`);
  } else {
    log(`[FATAL] Server error: ${err.message}`);
    console.error(`伺服器錯誤: ${err.message}`);
  }
  process.exit(1);
});

function shutdown() {
  log("Shutting down zen-header-injector");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.listen(LISTEN_PORT, "127.0.0.1", () => {
  const msg = `zen-header-injector (multikey) listening on http://127.0.0.1:${LISTEN_PORT}/v1 -> https://${UPSTREAM_HOST}${UPSTREAM_BASE}`;
  log(msg);
  if (!process.stdout.isTTY && process.env.ZEN_INJECTOR_CONSOLE !== "1") {
    // 輸出到日誌檔案
  }
});
