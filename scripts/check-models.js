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

const args = process.argv.slice(2);
let port = parseInt(process.env.ZEN_INJECTOR_PORT || "15722", 10);
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
  const upstreamModelsUrl = `https://opencode.ai/zen/v1/models`;

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

  const models = modelData.data || [];
  const freeModels = models.filter((m) => m.id && m.id.endsWith("-free"));
  const otherModels = models.filter((m) => m.id && !m.id.endsWith("-free"));

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          source: sourceName,
          proxyOnline: hasLocalProxy,
          health: healthData,
          freeModels: freeModels.map((m) => m.id),
          allModelsCount: models.length,
          recommendedBaseUrl: `http://127.0.0.1:${port}/v1`,
          recommendedModel: freeModels.length > 0 ? freeModels[0].id : null,
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
  console.log(`✨ 發現免費模型 (-free): ${freeModels.length} 個 | 其他模型: ${otherModels.length} 個\n`);

  console.log("--------------------------------------------------------");
  console.log(" 🆓 免費模型推薦清單 (直接填入 CC Switch 或 Agent 配置)");
  console.log("--------------------------------------------------------");
  freeModels.forEach((m, idx) => {
    console.log(`  ${idx + 1}. \x1b[32m${m.id.padEnd(30)}\x1b[0m (擁有者: ${m.owned_by || "opencode"})`);
  });

  if (showAll && otherModels.length > 0) {
    console.log("\n--------------------------------------------------------");
    console.log(" 💳 其他模型 (可能需要額外計費/官方配額)");
    console.log("--------------------------------------------------------");
    otherModels.forEach((m, idx) => {
      console.log(`  ${idx + 1}. ${m.id.padEnd(30)} (擁有者: ${m.owned_by || "opencode"})`);
    });
  } else if (otherModels.length > 0) {
    console.log(`\n💡 提示: 還有 ${otherModels.length} 個非免費模型，若要查看全部請加上參數: node scripts/check-models.js --all`);
  }

  console.log("\n========================================================");
  console.log(" 🚀 快速開始建議:");
  console.log(`    Base URL: http://127.0.0.1:${port}/v1`);
  if (freeModels.length > 0) {
    console.log(`    推薦模型: ${freeModels[0].id}`);
  }
  console.log("========================================================\n");
}

main().catch((err) => {
  console.error("執行失敗:", err);
  process.exit(1);
});
