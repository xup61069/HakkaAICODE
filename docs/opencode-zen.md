# OpenCode Zen 技術筆記

本文以 OpenCode 官方文件為主，不寫入未經驗證的配額數字。

官方來源：

- 文件：<https://opencode.ai/docs/zen/>
- 模型清單端點：<https://opencode.ai/zen/v1/models>

---

## 基本事實

- OpenCode Zen 是 OpenCode 官方提供的模型 Gateway，官方文件描述為「測試並驗證過的模型清單」。
- API key 是選填的，官方文件沒有把 API key 列為必備條件；登入與授權流程請以官方 CLI 與文件為準。
- 模型清單會變動，部分模型標記為 free，但官方文件亦說明其可能只是限時模型。
- 官方模型清單端點回傳的 JSON 沒有免費或計費欄位；`scripts/check-models.js` 只列出官方回傳的模型 ID，不猜免費或收費分級。
- 免費模型、每月限制與費用政策請直接讀官方文件，不要採信本 repo 內任何寫死的數字。

---

## 與本專案代理的關係

本專案 `scripts/server-multikey.js` 只是一個本機轉發代理：

```text
你的 Agent -> http://127.0.0.1:15722/v1 -> OpenCode Zen 官方端點
```

代理提供多 KEY 輪換、金鑰檔熱重載、健康端點與 CORS，方便你在多個 Agent 之間共用同一組設定。

預設附加的自訂標頭（`x-opencode-client`、`User-Agent: opencode`）是代理的可設定行為；是否為 OpenCode 官方要求，請以官方文件為準。

---

## 可用指令

```bash
node scripts/check-models.js
```

這個指令會先查本機代理，若代理未啟動則直接查官方模型清單端點。

健康檢查：

```bash
curl http://127.0.0.1:15722/__health
```

---

## 風險提醒

免費層與多帳號使用可能受上游服務條款限制。請先閱讀 OpenCode 官方文件與條款，再決定是否使用多 KEY 或自訂標頭設定。
