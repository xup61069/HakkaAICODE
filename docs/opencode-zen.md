# OpenCode Zen 免費後端技術筆記

OpenCode Zen 的官方免費端點是：

```text
https://opencode.ai/zen/v1
```

zen-header-injector 把它封裝成本地轉發端點：

```text
http://127.0.0.1:15722/v1
```

---

## 註冊與獲取認證

1. 可透過官方 CLI 執行 `opencode auth login`，或前往 <https://opencode.ai> 登入。
2. 登入後至 Dashboard / API Keys 頁面取得認證金鑰。
3. 將金鑰寫入本機 `%USERPROFILE%\HakkaAICODE\zen-keys.txt`（每行一把）。

官方文件：<https://opencode.ai/docs/zen/>

---

## 快速檢測模型與端點健康

免費模型名稱隨官方政策隨時調整，**請以即時查詢腳本為準**：

```bash
# 查看本地代理健康狀態與免費模型清單
node scripts/check-models.js

# 查看所有可用模型（含非免費模型）
node scripts/check-models.js --all
```

`-free` 結尾的模型屬於免費配額模型。

---

## 為什麼需要 zen-header-injector 與 ToS 聲明

CC Switch 或一般代理工具在轉發請求時會重組 Header，缺少 OpenCode Zen 免費方案所要求的兩個特定標頭：

- `x-opencode-client: terminal`
- `User-Agent: opencode`

zen-header-injector 會在轉送時補齊這兩個標頭，以解決使用 Zen 免費模型時的 `429 FreeUsageLimitError`。

> ⚠️ **服務條款與風險揭露**：  
> 注入上述標頭本質上是向服務端宣告自身為官方終端客戶端以獲取終端專屬免費額度。此機制可能處於上游服務條款之邊界地帶，隨時有被官方調整或限制之風險，請使用者自行評估。

---

## 真·無感原地輪換（In-Place Retry）與熱重載

本專案升級後的 `server-multikey.js` 提供完整的容錯機制：

1. **原地無感重試**：當 upstream 回傳 `429`（限流）或 `401`（無效金鑰）時，代理伺服器會在內部使用下一把可用 Key 重新發送請求，客戶端不會直接報錯中斷。
2. **401 與 429 差異化處理**：
   - `401 Unauthorized`：視為無效/被撤銷金鑰（標記為 Dead，冷卻 24 小時），避免重複浪費請求。
   - `429 Too Many Requests`：標記該 Key 冷卻（60 秒起、指數退避至最多 30 分鐘）；一旦請求成功（HTTP < 400），立即重置連續錯誤計數。
3. **即時熱重載**：修改 `zen-keys.txt` 存檔後自動熱重載金鑰，無需重啟 Node 進程。
4. **配額本質說明**：
   - 多 KEY 輪換適用於應對單一金鑰/帳號的速率限制。若上游整體免費池全線滿載，輪換亦無法產生新配額，此時建議切換至 [docs/free-ai-tiers.md](free-ai-tiers.md) 收錄之 Codestral、OpenRouter 或 Google Gemini 等替代方案。

---

## 代理健康與狀態檢查端點

可在瀏覽器或終端機存取：

```bash
curl http://127.0.0.1:15722/__health
```

回傳範例：
```json
{
  "status": "ok",
  "uptimeSeconds": 180,
  "totalRequests": 12,
  "totalRotations": 1,
  "totalRetriesSucceeded": 1,
  "keys": {
    "total": 3,
    "ready": 2,
    "cooling": 1,
    "dead": 0,
    "currentIndex": 2,
    "details": [
      { "index": 1, "maskedKey": "sk-6...ZTLn", "status": "ready" },
      { "index": 2, "maskedKey": "sk-x...yNPR", "status": "ready" },
      { "index": 3, "maskedKey": "sk-Q...jRHI", "status": "cooling", "coolingRemainingSeconds": 54 }
    ]
  }
}
```
