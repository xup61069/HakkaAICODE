"use strict";

const http = require("http");
const https = require("https");
const fs = require("fs");
const os = require("os");
const path = require("path");

const DEFAULT_KEYS_FILE = path.join(os.homedir(), "HakkaAICODE", "zen-keys.txt");
const MAX_LOG_SIZE = 2 * 1024 * 1024;
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
  "content-length",
  "authorization",
]);

function intValue(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseRotateOn(value) {
  return String(value || "429,401")
    .split(",")
    .map((part) => parseInt(part.trim(), 10))
    .filter((code) => !Number.isNaN(code));
}

function readConfig(env = process.env) {
  const upstreamHost = env.ZEN_INJECTOR_UPSTREAM_HOST || "opencode.ai";
  const baseHost = upstreamHost.replace(/:\d+$/, "");
  const upstreamBase = env.ZEN_INJECTOR_UPSTREAM_BASE || "/zen/v1";
  const upstreamProtocol =
    env.ZEN_INJECTOR_UPSTREAM_PROTOCOL ||
    (/^(127\.0\.0\.1|localhost)$/i.test(baseHost) ? "http" : "https");

  return {
    port: intValue(env.ZEN_INJECTOR_PORT, 15722),
    host: env.ZEN_INJECTOR_HOST || "127.0.0.1",
    keysFile: env.ZEN_INJECTOR_KEYS_FILE || DEFAULT_KEYS_FILE,
    inlineKeys: env.ZEN_INJECTOR_KEYS || "",
    upstreamHost,
    upstreamBase: upstreamBase.startsWith("/") ? upstreamBase : `/${upstreamBase}`,
    upstreamProtocol: upstreamProtocol === "http" ? "http" : "https",
    localPrefix: env.ZEN_INJECTOR_LOCAL_PREFIX || "/v1",
    headerName: env.ZEN_INJECTOR_HEADER_NAME || "x-opencode-client",
    headerValue: env.ZEN_INJECTOR_HEADER_VALUE || "terminal",
    userAgent: env.ZEN_INJECTOR_USER_AGENT || "opencode",
    rotateOn: parseRotateOn(env.ZEN_INJECTOR_ROTATE_ON),
    maxRetries: intValue(env.ZEN_INJECTOR_MAX_RETRY, 3),
    bodyLimit: intValue(env.ZEN_INJECTOR_BODY_LIMIT, 50 * 1024 * 1024),
    debug: env.ZEN_INJECTOR_DEBUG === "1",
    logFile: env.ZEN_INJECTOR_LOG || path.join(__dirname, "..", "injector.log"),
    console: env.ZEN_INJECTOR_CONSOLE === "1" || Boolean(process.stdout.isTTY),
  };
}

function maskKey(key) {
  if (!key || key.length < 8) return "********";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

function rotateLogIfNeeded(logFile) {
  try {
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.size > MAX_LOG_SIZE) {
        const oldLog = `${logFile}.old`;
        if (fs.existsSync(oldLog)) fs.unlinkSync(oldLog);
        fs.renameSync(logFile, oldLog);
      }
    }
  } catch (_) {
    // Log rotation is best-effort.
  }
}

class Logger {
  constructor(config) {
    this.file = config.logFile;
    this.console = config.console;
  }

  write(message) {
    const line = `[${new Date().toISOString()}] ${message}`;
    try {
      rotateLogIfNeeded(this.file);
      fs.appendFileSync(this.file, `${line}\n`);
    } catch (_) {
      // Never let logging break the proxy.
    }
    if (this.console) {
      console.log(line);
    }
  }
}

class KeyStore {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.keys = [];
    this.states = [];
    this.index = 0;
    this.lastMtime = 0;
    this.reloadForce = false;
    this.reload();
  }

  count() {
    return this.keys.length;
  }

  reload() {
    const keysFile = this.config.keysFile;
    try {
      if (fs.existsSync(keysFile)) {
        const stats = fs.statSync(keysFile);
        if (stats.mtimeMs !== this.lastMtime || this.reloadForce) {
          this.lastMtime = stats.mtimeMs;
          this.reloadForce = false;
          const content = fs.readFileSync(keysFile, "utf8");
          const nextKeys = content
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith("#"));
          this.applyKeys(nextKeys, `Loaded ${nextKeys.length} API keys from ${keysFile}`);
          return;
        }
        return;
      }
    } catch (err) {
      this.logger.write(`[Hot-Reload] Error reading ${keysFile}: ${err.message}`);
    }

    const inline = this.config.inlineKeys
      .split(",")
      .map((key) => key.trim())
      .filter(Boolean);
    if (inline.length > 0 && this.keys.length === 0) {
      this.applyKeys(inline, `Loaded ${inline.length} API keys from ZEN_INJECTOR_KEYS`);
    }
  }

  applyKeys(nextKeys, message) {
    const nextStates = nextKeys.map((key) => {
      const oldIndex = this.keys.indexOf(key);
      if (oldIndex !== -1 && this.states[oldIndex]) {
        return this.states[oldIndex];
      }
      return { dead: false, cooldownUntil: 0, consecutive429: 0 };
    });
    this.keys = nextKeys;
    this.states = nextStates;
    if (this.index >= this.keys.length) this.index = 0;
    if (message) this.logger.write(`[Hot-Reload] ${message}`);
  }

  startWatcher() {
    const dir = path.dirname(this.config.keysFile);
    try {
      if (fs.existsSync(dir)) {
        fs.watch(dir, () => {
          this.reloadForce = true;
          this.reload();
        });
      }
    } catch (_) {
      // File watching is best-effort; startup reload already loaded keys.
    }
  }

  coolingRemaining(index) {
    const state = this.states[index];
    if (!state || state.dead) return 0;
    return Math.max(0, Math.round((state.cooldownUntil - Date.now()) / 1000));
  }

  isCooling(index) {
    if (index < 0 || index >= this.keys.length) return false;
    const state = this.states[index];
    if (!state) return false;
    if (state.dead) return true;
    return Date.now() < state.cooldownUntil;
  }

  pick(exclude = new Set()) {
    this.reload();
    const count = this.keys.length;
    if (count === 0) return -1;

    for (let offset = 0; offset < count; offset++) {
      const index = (this.index + offset) % count;
      if (!exclude.has(index) && !this.isCooling(index)) {
        this.index = index;
        return index;
      }
    }

    let earliest = -1;
    for (let index = 0; index < count; index++) {
      if (exclude.has(index) || (this.states[index] && this.states[index].dead)) continue;
      if (
        earliest === -1 ||
        this.states[index].cooldownUntil < this.states[earliest].cooldownUntil
      ) {
        earliest = index;
      }
    }
    if (earliest !== -1) this.index = earliest;
    return earliest;
  }

  markSuccess(index) {
    if (index >= 0 && this.states[index]) {
      this.states[index].consecutive429 = 0;
    }
  }

  markStatus(index, status) {
    if (index < 0 || !this.states[index]) return;
    const state = this.states[index];
    const key = this.keys[index];

    if (status === 401) {
      state.dead = true;
      state.cooldownUntil = Date.now() + 24 * 3600 * 1000;
      this.logger.write(`[401 Invalid Key] key#${index + 1} (${maskKey(key)}) marked DEAD (24h cooldown).`);
    } else {
      state.consecutive429 += 1;
      const backoff = Math.min(60_000 * 2 ** (state.consecutive429 - 1), 30 * 60_000);
      state.cooldownUntil = Date.now() + backoff;
      this.logger.write(
        `[429 Rate Limited] key#${index + 1} (${maskKey(key)}) consecutive #${state.consecutive429}, cooling for ${Math.round(
          backoff / 1000
        )}s`
      );
    }
  }

  health() {
    return this.keys.map((key, index) => {
      const state = this.states[index] || { dead: false, cooldownUntil: 0, consecutive429: 0 };
      return {
        index: index + 1,
        maskedKey: maskKey(key),
        status: state.dead ? "dead" : this.isCooling(index) ? "cooling" : "ready",
        coolingRemainingSeconds: state.dead ? 0 : this.coolingRemaining(index),
        consecutiveErrors: state.consecutive429,
      };
    });
  }
}

function sanitizeHeaders(headers) {
  const clean = {};
  for (const [name, value] of Object.entries(headers || {})) {
    if (!HOP_BY_HOP.has(name.toLowerCase())) {
      clean[name] = value;
    }
  }
  return clean;
}

function writeJson(res, status, payload) {
  if (res.headersSent) return;
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(payload));
}

function handleHealth(config, store, req, res, stats) {
  store.reload();
  const details = store.health();
  const ready = details.filter((item) => item.status === "ready").length;
  const cooling = details.filter((item) => item.status === "cooling").length;
  const dead = details.filter((item) => item.status === "dead").length;
  const payload = {
    status: "ok",
    uptimeSeconds: Math.floor((Date.now() - stats.startTime) / 1000),
    totalRequests: stats.totalRequests,
    totalRotations: stats.totalRotations,
    totalRetriesSucceeded: stats.totalRetriesSucceeded,
    keys: {
      total: store.count(),
      ready,
      cooling,
      dead,
      currentIndex: store.count() > 0 ? store.index + 1 : 0,
      keysFile: fs.existsSync(config.keysFile) ? config.keysFile : null,
      details,
    },
    upstream: `${config.upstreamProtocol}://${config.upstreamHost}${config.upstreamBase}`,
    injectedHeaders: {
      [config.headerName]: config.headerValue,
      "user-agent": config.userAgent,
    },
  };
  writeJson(res, 200, payload);
}

function serveCors(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": "86400",
  });
  res.end();
}

function readRequestBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error("Request body too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function buildTargetUrl(config, requestUrl) {
  const url = new URL(requestUrl, `http://${config.host}:${config.port}/`);
  let targetPath = url.pathname;
  if (targetPath.startsWith(config.localPrefix)) {
    targetPath = targetPath.slice(config.localPrefix.length);
  }
  if (!targetPath.startsWith("/")) targetPath = `/${targetPath}`;
  const base = config.upstreamBase === "/" ? "" : config.upstreamBase;
  return new URL(
    `${base}${targetPath}${url.search}`,
    `${config.upstreamProtocol}://${config.upstreamHost}/`
  );
}

function proxyRequest(config, store, logger, stats, req, res, body, triedKeys = new Set()) {
  const target = buildTargetUrl(config, req.url);
  const headers = sanitizeHeaders(req.headers);
  headers[config.headerName] = config.headerValue;
  headers["user-agent"] = config.userAgent;

  const keyIndex = store.pick(triedKeys);
  if (keyIndex !== -1) {
    triedKeys.add(keyIndex);
    headers.authorization = `Bearer ${store.keys[keyIndex]}`;
  } else {
    delete headers.authorization;
  }

  if (body && body.length > 0) {
    headers["content-length"] = Buffer.byteLength(body);
  }

  const clientLib = target.protocol === "https:" ? https : http;
  let requestAborted = false;

  const upstreamReq = clientLib.request(
    target,
    { method: req.method, headers },
    (upstreamRes) => {
      if (requestAborted) return;
      const statusCode = upstreamRes.statusCode;

      if (
        keyIndex !== -1 &&
        config.rotateOn.includes(statusCode) &&
        triedKeys.size <= config.maxRetries &&
        triedKeys.size < store.count()
      ) {
        stats.totalRotations += 1;
        store.markStatus(keyIndex, statusCode);
        logger.write(
          `In-place retry triggered for ${req.method} ${target.pathname} (attempt ${triedKeys.size}/${config.maxRetries})`
        );
        upstreamRes.resume();
        return proxyRequest(config, store, logger, stats, req, res, body, triedKeys);
      }

      if (keyIndex !== -1) {
        if (statusCode < 400) {
          store.markSuccess(keyIndex);
          if (triedKeys.size > 1) {
            stats.totalRetriesSucceeded += 1;
            logger.write(`In-place retry succeeded on key#${keyIndex + 1}`);
          }
        } else if (config.rotateOn.includes(statusCode)) {
          stats.totalRotations += 1;
          store.markStatus(keyIndex, statusCode);
        }
      }

      const respHeaders = sanitizeHeaders(upstreamRes.headers);
      respHeaders["Access-Control-Allow-Origin"] = "*";
      if (config.debug && keyIndex !== -1) {
        respHeaders["x-zen-key-index"] = String(keyIndex + 1);
      }
      res.writeHead(statusCode, respHeaders);
      upstreamRes.pipe(res);
    }
  );

  upstreamReq.on("error", (err) => {
    logger.write(`ERROR ${req.method} ${target.href} -> ${err.message}`);
    if (!res.headersSent) {
      writeJson(res, 502, {
        error: {
          message: `Upstream proxy error: ${err.message}`,
          type: "proxy_error",
        },
      });
    }
  });

  req.on("aborted", () => {
    requestAborted = true;
    upstreamReq.destroy();
  });

  if (body && body.length > 0) {
    upstreamReq.write(body);
  }
  upstreamReq.end();
}

function startServer(config = readConfig()) {
  const logger = new Logger(config);
  const store = new KeyStore(config, logger);
  const stats = { startTime: Date.now(), totalRequests: 0, totalRotations: 0, totalRetriesSucceeded: 0 };

  store.startWatcher();
  if (store.count() > 0) {
    logger.write(`Initialized with ${store.count()} API keys (rotate on: ${config.rotateOn.join(",")})`);
  } else {
    logger.write("No API keys configured, running in plain passthrough mode");
  }

  const server = http.createServer((req, res) => {
    stats.totalRequests += 1;

    if (req.method === "OPTIONS") {
      serveCors(res);
      return;
    }

    const url = new URL(req.url, `http://${config.host}:${config.port}/`);
    if (url.pathname === "/__health" || url.pathname === "/v1/status" || url.pathname === "/status") {
      handleHealth(config, store, req, res, stats);
      return;
    }

    readRequestBody(req, config.bodyLimit)
      .then((body) => proxyRequest(config, store, logger, stats, req, res, body))
      .catch((err) => {
        if (!res.headersSent) {
          writeJson(res, err.status || 400, { error: { message: err.message, type: "request_error" } });
        }
      });
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      logger.write(`[FATAL] Port ${config.port} is already in use.`);
      console.error(`\n[錯誤] 端口 ${config.port} 已被佔用。`);
      console.error(`請執行 powershell -File .\\scripts\\setup-multikey.ps1 自動重啟，或指定端口：$env:ZEN_INJECTOR_PORT=15723\n`);
    } else {
      logger.write(`[FATAL] Server error: ${err.message}`);
      console.error(`伺服器錯誤: ${err.message}`);
    }
    process.exit(1);
  });

  const shutdown = () => {
    logger.write("Shutting down HakkaAICODE proxy");
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  server.listen(config.port, config.host, () => {
    logger.write(
      `HakkaAICODE proxy (in-place retry & CORS enabled) listening on http://${config.host}:${config.port}${config.localPrefix} -> ${config.upstreamProtocol}://${config.upstreamHost}${config.upstreamBase}`
    );
  });

  return server;
}

module.exports = { startServer, readConfig, KeyStore, buildTargetUrl };

if (require.main === module) {
  startServer();
}
