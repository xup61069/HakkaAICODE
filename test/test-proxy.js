// 自動化單元與整合測試套件（零外部依賴）
// 執行方式：node test/test-proxy.js

const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const TEST_MOCK_PORT = 15998;
const TEST_PROXY_PORT = 15999;
const TEST_DIR = path.join(os.tmpdir(), "hakka_test_" + Date.now());
const TEST_KEYS_FILE = path.join(TEST_DIR, "test-keys.txt");

fs.mkdirSync(TEST_DIR, { recursive: true });
fs.writeFileSync(TEST_KEYS_FILE, "sk-test-key-1\nsk-test-key-2\nsk-test-key-3\n", "utf8");

let mockRequestHistory = [];
let mockResponseStatusCode = 200;
let mockResponseHeaders = { "content-type": "application/json" };
let mockResponseBody = JSON.stringify({ result: "success" });

// 1. 建立 Mock Upstream 伺服器
const mockUpstream = http.createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    mockRequestHistory.push({
      method: req.method,
      url: req.url,
      headers: req.headers,
      body,
    });

    let status = mockResponseStatusCode;
    let respBody = mockResponseBody;

    // 若設定了自訂處理
    if (typeof mockResponseStatusCode === "function") {
      const result = mockResponseStatusCode(req, body);
      status = result.status;
      respBody = result.body || mockResponseBody;
    }

    res.writeHead(status, mockResponseHeaders);
    res.end(respBody);
  });
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log("\n==================================================");
  console.log(" 🧪 客家 AICODE - 代理伺服器全自動化測試套件");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  // 啟動 Mock Upstream
  await new Promise((resolve) => mockUpstream.listen(TEST_MOCK_PORT, "127.0.0.1", resolve));

  // 啟動 Proxy
  const serverPath = path.join(__dirname, "..", "scripts", "server-multikey.js");
  const proxyProcess = spawn(
    process.execPath,
    [serverPath],
    {
      env: {
        ...process.env,
        ZEN_INJECTOR_PORT: String(TEST_PROXY_PORT),
        ZEN_INJECTOR_KEYS_FILE: TEST_KEYS_FILE,
        ZEN_INJECTOR_UPSTREAM_HOST: `127.0.0.1:${TEST_MOCK_PORT}`,
        ZEN_INJECTOR_UPSTREAM_BASE: "/zen/v1",
      },
    }
  );

  await sleep(1000);

  try {
    // 測試 1: 健康端點 (/__health)
    console.log("[*] 測試健康檢測端點...");
    const health = await makeRequest({
      hostname: "127.0.0.1",
      port: TEST_PROXY_PORT,
      path: "/__health",
      method: "GET",
    });
    const healthJson = JSON.parse(health.body);
    assert(health.statusCode === 200, "健康端點回應 HTTP 200");
    assert(healthJson.status === "ok", "健康端點 status 為 'ok'");
    assert(healthJson.keys.total === 3, "成功載入 3 把金鑰");
    assert(healthJson.keys.ready === 3, "初始 3 把金鑰皆處於 ready 狀態");

    // 測試 1.5: CORS 預檢請求
    console.log("\n[*] 測試 CORS 預檢...");
    const corsRes = await makeRequest({
      hostname: "127.0.0.1",
      port: TEST_PROXY_PORT,
      path: "/v1/models",
      method: "OPTIONS",
    });
    assert(corsRes.statusCode === 204, "OPTIONS 預檢回應 HTTP 204");
    assert(corsRes.headers["access-control-allow-origin"] === "*", "OPTIONS 包含 CORS allow-origin");

    // 測試 1.6: 狀態端點
    const statusRes = await makeRequest({
      hostname: "127.0.0.1",
      port: TEST_PROXY_PORT,
      path: "/v1/status",
      method: "GET",
    });
    const statusJson = JSON.parse(statusRes.body);
    assert(statusRes.statusCode === 200, "狀態端點回應 HTTP 200");
    assert(statusJson.status === "ok", "狀態端點 status 為 'ok'");

    // 測試 2: 標頭注入 (Header Injection)
    console.log("\n[*] 測試標頭注入與金鑰附帶...");
    mockRequestHistory = [];
    mockResponseStatusCode = 200;
    mockResponseBody = JSON.stringify({ model: "deepseek-v4-flash-free" });

    const proxyRes = await makeRequest(
      {
        hostname: "127.0.0.1",
        port: TEST_PROXY_PORT,
        path: "/v1/models",
        method: "GET",
      }
    );

    assert(proxyRes.statusCode === 200, "轉發請求成功回應 200");
    assert(mockRequestHistory.length === 1, "Upstream 收到 1 次請求");
    assert(mockRequestHistory[0].headers["x-opencode-client"] === "terminal", "成功注入 x-opencode-client: terminal");
    assert(mockRequestHistory[0].headers["user-agent"] === "opencode", "成功注入 user-agent: opencode");
    assert(mockRequestHistory[0].headers["authorization"] === "Bearer sk-test-key-1", "正確附帶第 1 把金鑰 Bearer Header");

    // 測試 3: 原地無感重試 (In-Place Retry on 429)
    console.log("\n[*] 測試 429 觸發原地無感重試 (In-Place Retry)...");
    mockRequestHistory = [];
    let reqCount = 0;
    mockResponseStatusCode = (req) => {
      reqCount++;
      if (reqCount === 1) {
        return { status: 429, body: JSON.stringify({ error: "rate limit" }) };
      }
      return { status: 200, body: JSON.stringify({ success: true, fromKey: req.headers["authorization"] }) };
    };

    const retryRes = await makeRequest(
      {
        hostname: "127.0.0.1",
        port: TEST_PROXY_PORT,
        path: "/v1/chat/completions",
        method: "POST",
        headers: { "content-type": "application/json" },
      },
      JSON.stringify({ prompt: "hello" })
    );

    assert(retryRes.statusCode === 200, "客戶端收到重試成功的 HTTP 200 (非 429)");
    assert(mockRequestHistory.length === 2, "Upstream 共收到 2 次請求 (第 1 次失敗, 第 2 次換 key 重試)");
    assert(mockRequestHistory[0].headers["authorization"] === "Bearer sk-test-key-1", "第 1 次使用 key#1");
    assert(mockRequestHistory[1].headers["authorization"] === "Bearer sk-test-key-2", "第 2 次自動換用 key#2");

    // 測試 4: 401 Dead Key 標記
    console.log("\n[*] 測試 401 撤銷金鑰 (Dead Key) 標記與換 Key 重試...");
    mockRequestHistory = [];
    reqCount = 0;
    mockResponseStatusCode = (req) => {
      reqCount++;
      if (req.headers["authorization"] === "Bearer sk-test-key-2") {
        return { status: 401, body: JSON.stringify({ error: "unauthorized" }) };
      }
      return { status: 200, body: JSON.stringify({ success: true }) };
    };

    const authRes = await makeRequest(
      {
        hostname: "127.0.0.1",
        port: TEST_PROXY_PORT,
        path: "/v1/chat/completions",
        method: "POST",
      },
      JSON.stringify({ test: "401" })
    );

    assert(authRes.statusCode === 200, "遇到 401 自動換到 key#3 重試成功");
    const healthAfter401 = await makeRequest({
      hostname: "127.0.0.1",
      port: TEST_PROXY_PORT,
      path: "/__health",
      method: "GET",
    });
    const health401Json = JSON.parse(healthAfter401.body);
    assert(health401Json.keys.dead >= 1, "key#2 被成功標記為 dead: true");

    // 測試 5: 金鑰熱重載 (Hot Reload)
    console.log("\n[*] 測試修改 zen-keys.txt 即時熱重載 (Hot-Reload)...");
    fs.writeFileSync(TEST_KEYS_FILE, "sk-new-key-A\nsk-new-key-B\n", "utf8");
    await sleep(200);

    const healthAfterReload = await makeRequest({
      hostname: "127.0.0.1",
      port: TEST_PROXY_PORT,
      path: "/__health",
      method: "GET",
    });
    const reloadJson = JSON.parse(healthAfterReload.body);
    assert(reloadJson.keys.total === 2, "熱重載後金鑰總數更新為 2 把");
    assert(reloadJson.keys.details[0].maskedKey === "sk-n...ey-A", "第一把金鑰更新為 sk-new-key-A");

  } finally {
    // 清理進程與檔案
    proxyProcess.kill();
    mockUpstream.close();
    try {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    } catch (_) {}
  }

  console.log("\n==================================================");
  console.log(` 📊 測試結果: 通過 ${passed} 項 | 失敗 ${failed} 項`);
  console.log("==================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("測試執行出錯:", err);
  process.exit(1);
});
