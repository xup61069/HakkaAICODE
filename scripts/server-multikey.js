// 多 KEY 輪換版 zen-header-injector：零依賴、可直接取代 server.js 使用。
//
// 行為相容且具備真·無感自動輪換與熱重載：
//   - 收到 429 時：在 Proxy 內部直接使用下一把可用 Key 原地重試（In-Place Retry），請求不中斷
//   - 收到 401 時：標記該 Key 為失效/已撤銷 (Dead Key，冷卻 24 小時)，並立即換 Key 重試
//   - 請求成功 (HTTP < 400) 時：重置該 Key 的連續錯誤次數 (consecutive429 = 0)
//   - 自動監聽/偵測金鑰檔案 (zen-keys.txt) 修改時間，存檔後自動熱重載
//   - 日誌輪替機制：日誌大小超過 2MB 時自動滾動，避免檔案無限增長
//   - CORS 完整支援：支援 OPTIONS 預檢與跨來源存取，相容各類 Web UI / 瀏覽器外掛
//   - 狀態檢測端點：GET /__health 或 GET /v1/status（金鑰去識別化遮蔽）
//
// 環境變數：
//   ZEN_INJECTOR_PORT      : 監聽端口，預設 15722
//   ZEN_INJECTOR_KEYS_FILE : key 清單檔路徑，一行一把，支援 # 註解
//   ZEN_INJECTOR_KEYS      : 逗號分隔的 key 清單（inline 用，優先度低於檔案）
//   ZEN_INJECTOR_ROTATE_ON : 觸發輪換的狀態碼，預設 "429,401"
//   ZEN_INJECTOR_MAX_RETRY : 單次請求最大原地重試次數，預設 3
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
const MAX_RETRIES = parseInt(process.env.ZEN_INJECTOR_MAX_RETRY || "3", 10);
const DEBUG = process.env.ZEN_INJECTOR_DEBUG === "1";

const isHttps =
  process.env.ZEN_INJECTOR_UPSTREAM_PROTOCOL !== "http" &&
  !UPSTREAM_HOST.startsWith("127.0.0.1") &&
  !UPSTREAM_HOST.startsWith("localhost");
const clientLib = isHttps ? https : http;
const protocolStr = isHttps ? "https:" : "http:";

const LOG = process.env.ZEN_INJECTOR_LOG || path.join(__dirname, "injector.log");
const MAX_LOG_SIZE = 2 * 1024 * 1024; // 2MB

function rotateLogIfNeeded() {
  try {
    if (fs.existsSync(LOG)) {
      const stats = fs.statSync(LOG);
      if (stats.size > MAX_LOG_SIZE) {
        const oldLog = LOG + ".old";
        if (fs.existsSync(oldLog)) fs.unlinkSync(oldLog);
        fs.renameSync(LOG, oldLog);
      }
    }
  } catch (_) {}
}

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  try {
    rotateLogIfNeeded();
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
let totalRetriesSucceeded = 0;
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

        const newKeys = lines;
        const newStates = newKeys.map((k) => {
          const oldIdx = currentKeys.indexOf(k);
          if (oldIdx !== -1 && keysState[oldIdx]) {
            return keysState[oldIdx];
          }
          return { cooldownUntil: 0, consecutive429: 0, dead: false };
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

  if (currentKeys.length === 0 && process.env.ZEN_INJECTOR_KEYS) {
    currentKeys = process.env.ZEN_INJECTOR_KEYS.split(",")
      .map((k) => k.trim())
      .filter((k) => k);
    keysState = currentKeys.map(() => ({ cooldownUntil: 0, consecutive429: 0, dead: false }));
    if (currentKeys.length > 0) {
      log(`Loaded ${currentKeys.length} API keys from ZEN_INJECTOR_KEYS env variable`);
    }
  }
}

// 監聽金鑰檔案目錄異動
try {
  if (fs.existsSync(path.dirname(keysFile))) {
    fs.watch(path.dirname(keysFile), (eventType, filename) => {
      if (filename && filename.includes(path.basename(keysFile))) {
        reloadKeysIfNeeded();
      }
    });
  }
} catch (_) {}

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
  if (idx < 0 || idx >= keysState.length) return false;
  if (keysState[idx].dead) return true;
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

function pickKeyIndex(excludeIndices = new Set()) {
  reloadKeysIfNeeded();
  const count = currentKeys.length;
  if (count === 0) return -1;

  for (let i = 0; i < count; i++) {
    const idx = (currentIndex + i) % count;
    if (!isCooling(idx) && !excludeIndices.has(idx)) {
      currentIndex = idx;
      return idx;
    }
  }

  let earliest = -1;
  for (let i = 0; i < count; i++) {
    if (excludeIndices.has(i) || keysState[i].dead) continue;
    if (earliest === -1 || keysState[i].cooldownUntil < keysState[earliest].cooldownUntil) {
      earliest = i;
    }
  }

  if (earliest !== -1) {
    currentIndex = earliest;
    return earliest;
  }

  return -1;
}

function markCooldown(idx, status) {
  if (idx < 0 || idx >= keysState.length) return;
  totalRotations++;
  const st = keysState[idx];

  if (status === 401) {
    st.dead = true;
    st.cooldownUntil = now() + 24 * 3600 * 1000;
    log(`[401 Invalid Key] key#${idx + 1} (${maskKey(currentKeys[idx])}) marked DEAD (24h cooldown).`);
  } else {
    st.consecutive429 += 1;
    const backoff = Math.min(60_000 * Math.pow(2, st.consecutive429 - 1), 30 * 60_000);
    st.cooldownUntil = now() + backoff;
    log(
      `[429 Rate Limited] key#${idx + 1} (${maskKey(currentKeys[idx])}) consecutive #${st.consecutive429}, cooling for ${Math.round(
        backoff / 1000
      )}s`
    );
  }

  if (idx === currentIndex) {
    const next = nextIndexFrom(idx);
    if (next !== -1) currentIndex = next;
  }
}

function markSuccess(idx) {
  if (idx >= 0 && idx < keysState.length) {
    if (keysState[idx].consecutive429 > 0) {
      keysState[idx].consecutive429 = 0;
    }
  }
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

// 轉發請求（含原地無感重試）
function forwardRequest(req, res, reqBody, triedKeys = new Set()) {
  const u = new URL(req.url, "http://localhost");
  let targetPath = u.pathname;
  if (targetPath.startsWith("/v1")) targetPath = targetPath.slice(3);
  const targetUrl = `${protocolStr}//${UPSTREAM_HOST}${UPSTREAM_BASE}${targetPath}${u.search}`;

  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (HOP_BY_HOP.has(k.toLowerCase())) continue;
    headers[k] = v;
  }
  headers[HEADER_NAME] = HEADER_VALUE;
  headers["user-agent"] = USER_AGENT;

  const keyIndex = pickKeyIndex(triedKeys);
  if (keyIndex !== -1) {
    triedKeys.add(keyIndex);
    headers["authorization"] = `Bearer ${currentKeys[keyIndex]}`;
    if (DEBUG) res.setHeader("x-zen-key-index", String(keyIndex + 1));
  }

  if (reqBody && reqBody.length > 0) {
    headers["content-length"] = Buffer.byteLength(reqBody);
  }

  let requestAborted = false;
  const upstreamReq = clientLib.request(
    targetUrl,
    { method: req.method, headers },
    (upstreamRes) => {
      if (requestAborted) return;

      const statusCode = upstreamRes.statusCode;

      if (
        keyIndex !== -1 &&
        ROTATE_ON.includes(statusCode) &&
        triedKeys.size <= MAX_RETRIES &&
        triedKeys.size < currentKeys.length
      ) {
        markCooldown(keyIndex, statusCode);
        log(
          `In-place retry triggered for ${req.method} ${targetPath} (attempt ${triedKeys.size}/${MAX_RETRIES})`
        );
        upstreamRes.resume();
        return forwardRequest(req, res, reqBody, triedKeys);
      }

      if (statusCode < 400) {
        if (keyIndex !== -1) markSuccess(keyIndex);
        if (triedKeys.size > 1) {
          totalRetriesSucceeded++;
          log(`In-place retry succeeded on key#${keyIndex + 1}`);
        }
      } else if (keyIndex !== -1 && ROTATE_ON.includes(statusCode)) {
        markCooldown(keyIndex, statusCode);
      }

      const respHeaders = {};
      for (const [k, v] of Object.entries(upstreamRes.headers)) {
        if (HOP_BY_HOP.has(k.toLowerCase())) continue;
        respHeaders[k] = v;
      }
      respHeaders["Access-Control-Allow-Origin"] = "*";

      res.writeHead(statusCode, respHeaders);
      upstreamRes.pipe(res);
    }
  );

  upstreamReq.on("error", (err) => {
    log(`ERROR ${req.method} ${targetUrl} -> ${err.message}`);
    if (!res.headersSent) {
      res.writeHead(502, {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(JSON.stringify({ error: { message: `Upstream proxy error: ${err.message}`, type: "proxy_error" } }));
    }
  });

  req.on("aborted", () => {
    requestAborted = true;
    upstreamReq.destroy();
  });

  if (reqBody && reqBody.length > 0) {
    upstreamReq.write(reqBody);
  }
  upstreamReq.end();
}

const server = http.createServer((req, res) => {
  totalRequests++;

  // ---- CORS 預檢請求處理 ----
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "86400",
    });
    res.end();
    return;
  }

  const u = new URL(req.url, "http://localhost");

  // ---- 狀態與健康檢查端點 ----
  if (u.pathname === "/__health" || u.pathname === "/v1/status" || u.pathname === "/status") {
    reloadKeysIfNeeded();
    const readyKeys = keysState.filter((st, idx) => !st.dead && !isCooling(idx)).length;
    const coolingKeys = keysState.filter((st, idx) => !st.dead && isCooling(idx)).length;
    const deadKeys = keysState.filter((st) => st.dead).length;

    const payload = {
      status: "ok",
      uptimeSeconds: Math.floor((now() - startTime) / 1000),
      totalRequests,
      totalRotations,
      totalRetriesSucceeded,
      keys: {
        total: currentKeys.length,
        ready: readyKeys,
        cooling: coolingKeys,
        dead: deadKeys,
        currentIndex: currentKeys.length > 0 ? currentIndex + 1 : 0,
        keysFile: fs.existsSync(keysFile) ? keysFile : null,
        details: currentKeys.map((k, idx) => ({
          index: idx + 1,
          maskedKey: maskKey(k),
          status: keysState[idx].dead ? "dead" : isCooling(idx) ? "cooling" : "ready",
          coolingRemainingSeconds: isCooling(idx) && !keysState[idx].dead
            ? Math.max(0, Math.round((keysState[idx].cooldownUntil - now()) / 1000))
            : 0,
          consecutiveErrors: keysState[idx].consecutive429,
        })),
      },
      upstream: `${protocolStr}//${UPSTREAM_HOST}${UPSTREAM_BASE}`,
      injectedHeaders: {
        [HEADER_NAME]: HEADER_VALUE,
        "user-agent": USER_AGENT,
      },
    };

    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(JSON.stringify(payload, null, 2));
    return;
  }

  // 緩存 Request Body 以支援原地重試
  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    const reqBody = chunks.length > 0 ? Buffer.concat(chunks) : null;
    forwardRequest(req, res, reqBody);
  });
  req.on("error", (err) => {
    log(`Client request error: ${err.message}`);
  });
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    log(`[FATAL] Port ${LISTEN_PORT} is already in use.`);
    console.error(`\n[錯誤] 端口 ${LISTEN_PORT} 已被佔用。`);
    console.error(`請執行 powershell -File .\\scripts\\setup-multikey.ps1 自動重啟，或指定端口：$env:ZEN_INJECTOR_PORT=15723\n`);
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
  const msg = `zen-header-injector (in-place retry & CORS enabled) listening on http://127.0.0.1:${LISTEN_PORT}/v1 -> ${protocolStr}//${UPSTREAM_HOST}${UPSTREAM_BASE}`;
  log(msg);
});
