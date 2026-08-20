#!/usr/bin/env node
// 查詢與測試 OpenCode Zen / 本地代理可用模型的輕量腳本（零第三方依賴）
//
// 使用方式：
//   node scripts/check-models.js
//   node scripts/check-models.js --port 15722
//   node scripts/check-models.js --all
//   node scripts/check-models.js --json

const http = require("http");
const https = require("https");
const { readConfig } = require("../src/proxy");

const args = process.argv.slice(2);
const config = readConfig();
let port = config.port;
let showAll = args.includes("--all");
let jsonOutput = args.includes("--json");

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--port" && args[i + 1]) {
    port = parseInt(args[i + 1], 10);
  }
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { headers: { "user-agent": "opencode", "x-opencode-client": "terminal" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`JSON 解析失敗: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(6000, () => {
      req.destroy();
      reject(new Error("連線逾時 (6s)"));
    });
  });
}

async function main() {
  const localHealthUrl = `http://127.0.0.1:${port}/__health`;
  const localModelsUrl = `http://127.0.0.1:${port}/v1/models`;
  const upstreamModelsUrl = `${config.upstreamProtocol}://${config.upstreamHost}${config.upstreamBase}/models`;

  // 1. 檢查本地代理狀態
  let hasLocalProxy = false;
  let healthData = null;
  try {
    healthData = await fetchJson(localHealthUrl);
    hasLocalProxy = true;
  } catch (_) {
    hasLocalProxy = false;
  }

  // 2. 獲取模型清單
  let modelData = null;
  let sourceName = "";
  try {
    if (hasLocalProxy) {
      modelData = await fetchJson(localModelsUrl);
      sourceName = `本地代理 (http://127.0.0.1:${port}/v1/models)`;
    } else {
      modelData = await fetchJson(upstreamModelsUrl);
      sourceName = `官方直連 (${upstreamModelsUrl})`;
    }
  } catch (err) {
    if (jsonOutput) {
      console.log(JSON.stringify({ error: err.message }));
    } else {
      console.error(`\n❌ 無法取得模型清單: ${err.message}`);
    }
    process.exit(1);
  }

  const models = Array.isArray(modelData.data) ? modelData.data.filter((m) => m.id) : [];
  const modelIds = models.map((m) => m.id).sort((a, b) => a.localeCompare(b));

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          source: sourceName,
          proxyOnline: hasLocalProxy,
          health: healthData,
          modelCount: modelIds.length,
          models: modelIds,
          recommendedBaseUrl: `http://127.0.0.1:${port}/v1`,
          note: "OpenCode Zen 的模型清單端點未標示免費或付費分級；額度與費用請以官方文件為準。",
        },
        null,
        2
      )
    );
    return;
  }

  console.log("\n========================================================");
  console.log(" 🍜 客家 AICODE - OpenCode Zen 模型與端點狀態檢測");
  console.log("========================================================\n");

  if (hasLocalProxy) {
    console.log(`[*] 本地代理狀態 (http://127.0.0.1:${port}) : ✅ 運行中`);
    if (healthData && healthData.keys) {
      console.log(`    - 註冊金鑰總數: ${healthData.keys.total} 把 (可用: ${healthData.keys.ready} / 冷卻: ${healthData.keys.cooling} / 失效: ${healthData.keys.dead || 0})`);
      if (healthData.keys.currentIndex > 0) {
        console.log(`    - 當前使用金鑰: 第 ${healthData.keys.currentIndex} 把`);
      }
      if (healthData.keys.keysFile) {
        console.log(`    - 金鑰檔案路徑: ${healthData.keys.keysFile}`);
      }
    }
  } else {
    console.log(`[*] 本地代理狀態 (http://127.0.0.1:${port}) : ⚠️ 未啟動 (改走官方直連)`);
    console.log(`    提示: 可執行 powershell -File .\\scripts\\setup-multikey.ps1 啟動代理`);
  }

  console.log(`\n📦 資料來源: ${sourceName}`);
  console.log(`✨ 可用模型總數: ${modelIds.length}\n`);

  console.log("--------------------------------------------------------");
  console.log(" 📋 模型清單（官方端點未標示免費或付費分級）");
  console.log("--------------------------------------------------------");
  const visibleModels = showAll ? modelIds : modelIds.slice(0, 20);
  visibleModels.forEach((id, idx) => {
    console.log(`  ${idx + 1}. ${id}`);
  });
  if (!showAll && modelIds.length > visibleModels.length) {
    console.log(`\n💡 還有 ${modelIds.length - visibleModels.length} 個模型，若要查看全部請加上參數: node scripts/check-models.js --all`);
  }
  console.log("\n⚠️ 額度與計費請以官方文件為準：https://opencode.ai/docs/zen/");

  console.log("\n========================================================");
  console.log(" 🚀 快速開始建議:");
  console.log(`    Base URL: http://127.0.0.1:${port}/v1`);
  console.log("========================================================\n");
}

main().catch((err) => {
  console.error("執行失敗:", err);
  process.exit(1);
});
