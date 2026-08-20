# OpenCode Zen 免費後端筆記

OpenCode Zen 的官方免費額度 endpoint 是：

```text
https://opencode.ai/zen/v1
```

zen-header-injector 把它包成本地端點：

```text
http://127.0.0.1:15722/v1
```

---

## 註冊與拿金鑰

1. 打開 <https://opencode.ai/auth>。
2. 選擇註冊或登入方式（GitHub / Google / Email）。
3. 登入後到 API keys / Dashboard，依照官方流程完成必要設定，複製 API key。
4. 將金鑰寫入本機 `%USERPROFILE%\HakkaAICODE\zen-keys.txt`，或在提示詞中提供給 Agent。

官方文件：<https://opencode.ai/docs/zen/>

---

## 快速檢測模型與端點健康

本專案提供零依賴的檢測工具：

```bash
# 查看本地代理健康狀態與免費模型清單
node scripts/check-models.js

# 查看所有可用模型（含非免費模型）
node scripts/check-models.js --all
```

`-free` 結尾的模型屬於免費額度模型（如 `deepseek-v4-flash-free`、`mimo-v2.5-free`、`nemotron-3.5-lightning-free` 等）。

---

## 為什麼需要 zen-header-injector

CC Switch 或一般 OpenAI 轉發代理在傳送請求時會重新組裝 Header，不會自動帶上 OpenCode Zen 免費方案所必須的兩個特定標頭：

- `x-opencode-client: terminal`
- `User-Agent: opencode`

zen-header-injector 會在請求轉發時把這兩個標頭補齊，徹底解決 Codex / Claude Code 透過 CC Switch 連線時出現的 `429 FreeUsageLimitError`。

---

## 多 KEY 自動輪換與熱重載 (Hot-Reload)

當單一把 API Key 遭遇頻率限制或額度耗盡時，多 KEY 輪換代理會自動接管：

1. **部署代理**：執行 `powershell -File .\scripts\setup-multikey.ps1`（macOS/Linux 請執行 `bash ./scripts/setup-multikey.sh`）。
2. **填寫金鑰**：將多把金鑰一行一把貼進 `zen-keys.txt`（預設位置：`%USERPROFILE%\HakkaAICODE\zen-keys.txt`，支援 `#` 註解）。
3. **即時熱重載**：修改 `zen-keys.txt` 存檔後，背景運行的代理會自動偵測檔案變更並重載金鑰，**無需重啟 Node 進程**。
4. **智慧退避機制**：
   - 遭遇 `429` 或 `401` 時自動標記該 Key 冷卻（60 秒起、逐次指數加倍、上限 30 分鐘）。
   - 自動切換至下一把未在冷卻狀態的可用 Key。
   - 所有 Key 皆在冷卻時，自動挑選「冷卻剩餘時間最短」的 Key 優先嘗試。

---

## 代理健康與狀態檢查端點

可在瀏覽器或終端機呼叫：

```bash
curl http://127.0.0.1:15722/__health
```

回傳 JSON 範例：
```json
{
  "status": "ok",
  "uptimeSeconds": 120,
  "totalRequests": 45,
  "totalRotations": 2,
  "keys": {
    "total": 3,
    "ready": 2,
    "cooling": 1,
    "currentIndex": 2,
    "details": [
      { "index": 1, "maskedKey": "sk-6...ZTLn", "isCooling": false },
      { "index": 2, "maskedKey": "sk-x...yNPR", "isCooling": false },
      { "index": 3, "maskedKey": "sk-Q...jRHI", "isCooling": true, "coolingRemainingSeconds": 45 }
    ]
  }
}
```

---

## 疑難排解 (FAQ)

- **Port 15722 被佔用 (EADDRINUSE)**：
  重新執行 `powershell -File .\scripts\setup-multikey.ps1` 會自動幫你關閉舊進程並重啟；或自訂端口：`$env:ZEN_INJECTOR_PORT=15723; node scripts/server-multikey.js`。
- **所有 Key 都回傳 429**：
  若官方上游整個共用免費池均已飽和，請稍候再試，或使用 [docs/free-ai-tiers.md](free-ai-tiers.md) 介紹的 OpenRouter Free / Google AI Studio / GitHub Models 替代方案。

---

## 相關專案與連結

- [zen-header-injector](https://github.com/xup61069/zen-header-injector)
- [cc-switch](https://github.com/farion1231/cc-switch)
- [OpenCode Zen Official](https://opencode.ai)
