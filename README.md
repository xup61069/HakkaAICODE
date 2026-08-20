# HakkaAICODE

客家 AICODE（HakkaAICODE）是一份以「來源可查證」為原則的 AI coding 免費與平價後端筆記，並附本機多 KEY 轉發代理、模型查詢程式，以及各 Agent 的設定提示詞。

本專案強調：**額度、模型名稱與條款會變動，不能寫死成永久事實。** README 與文件只列出官方網址與可重現的指令，具體配額請以官方頁面當下內容為準。

---

## 專案結構

| 路徑 | 用途 |
| :--- | :--- |
| `src/proxy.js` | 零依賴本機轉發代理本體；支援多 KEY 輪換、熱重載與健康檢查 |
| `scripts/server-multikey.js` | 相容入口，載入 `src/proxy.js` |
| `scripts/check-models.js` | 查詢本地代理或 OpenCode Zen 的模型清單 |
| `scripts/setup-multikey.ps1` | Windows PowerShell 設定與啟動代理 |
| `scripts/setup-multikey.sh` | macOS / Linux / WSL 設定與啟動代理 |
| `prompts/` | 各後端的 Agent 設定提示詞 |
| `docs/` | OpenCode Zen、免費/平價資源與省額度心法的參考資料 |
| `test/` | 零依賴代理測試 |

---

## 已驗證來源

以下工具與官方頁面都有公開來源；本專案不做未附官方頁的承諾。

| 主題 | 官方來源 |
| :--- | :--- |
| OpenCode Zen | <https://opencode.ai/docs/zen/> |
| OpenCode Zen 模型清單 | <https://opencode.ai/zen/v1/models> |
| CC Switch | <https://github.com/farion1231/cc-switch/releases> |
| Mistral / Codestral | <https://docs.mistral.ai/> |
| Google AI Studio / Gemini API | <https://ai.google.dev/gemini-api/docs> |
| OpenRouter | <https://openrouter.ai/docs> |
| NVIDIA NIM | <https://build.nvidia.com/> |
| GitHub Models（已退役，官方文件仍保留） | <https://docs.github.com/en/github-models> |

OpenCode Zen 目前官方文件描述為「OpenCode 團隊挑選並驗證過的模型清單」，API key 為選填；官方模型清單端點沒有免費或計費欄位，模型清單與免費政策會變動，請以官方頁面和 `node scripts/check-models.js` 實測結果為準。

---

## 快速開始

### 1. 建立本機金鑰檔

代理預設讀取：

| 系統 | 路徑 |
| :--- | :--- |
| Windows | `%USERPROFILE%\HakkaAICODE\zen-keys.txt` |
| macOS / Linux | `~/HakkaAICODE/zen-keys.txt` |

每行一把金鑰，`#` 開頭為註解。金鑰檔已列入 `.gitignore`，不要把內容提交到 repo。

### 2. 啟動代理

Windows PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-multikey.ps1
```

macOS / Linux / WSL：

```bash
chmod +x ./scripts/setup-multikey.sh
./scripts/setup-multikey.sh
```

### 3. 確認狀態與模型

```bash
curl http://127.0.0.1:15722/__health
node scripts/check-models.js
```

本地代理端點預設為：

```text
http://127.0.0.1:15722/v1
```

---

## 代理功能與設定

代理沒有第三方 runtime 依賴，監聽本機 `127.0.0.1`，並轉發到設定的 upstream。

支援：

- 多把金鑰輪換，遇到 `429` / `401` 時可在代理內用下一把可用金鑰重試。
- `zen-keys.txt` 存檔後熱重載，不需重啟。
- `GET /__health` 回傳金鑰狀態、連線目標與統計資訊。
- CORS 預檢請求。

可用環境變數：

| 變數 | 預設 | 說明 |
| :--- | :--- | :--- |
| `ZEN_INJECTOR_PORT` | `15722` | 監聽端口 |
| `ZEN_INJECTOR_HOST` | `127.0.0.1` | 監聽介面 |
| `ZEN_INJECTOR_KEYS_FILE` | 使用者目錄下的 `zen-keys.txt` | 金鑰檔路徑 |
| `ZEN_INJECTOR_KEYS` | 空 | 逗號分隔的內嵌金鑰，僅在沒有金鑰檔時使用 |
| `ZEN_INJECTOR_UPSTREAM_HOST` | `opencode.ai` | 上游 host |
| `ZEN_INJECTOR_UPSTREAM_BASE` | `/zen/v1` | 上游路徑 |
| `ZEN_INJECTOR_UPSTREAM_PROTOCOL` | 自動 | `http` 或 `https`，可覆寫自動偵測 |
| `ZEN_INJECTOR_ROTATE_ON` | `429,401` | 逗號分隔狀態碼；這些狀態碼觸發換金鑰重試 |
| `ZEN_INJECTOR_LOCAL_PREFIX` | `/v1` | 本機端點路徑，轉發前會去掉 |
| `ZEN_INJECTOR_BODY_LIMIT` | `52428800` | request body 上限（bytes） |
| `ZEN_INJECTOR_LOG` | 專案根目錄的 `injector.log` | 日誌路徑 |
| `ZEN_INJECTOR_CONSOLE` | 依 stdout 是否為 TTY，可設 `1` | 同時輸出到 console |
| `ZEN_INJECTOR_HEADER_NAME` / `ZEN_INJECTOR_HEADER_VALUE` | `x-opencode-client` / `terminal` | 附加的自訂標頭 |
| `ZEN_INJECTOR_USER_AGENT` | `opencode` | 轉發時的 `User-Agent` |
| `ZEN_INJECTOR_MAX_RETRY` | `3` | 單次請求最大原地重試次數 |
| `ZEN_INJECTOR_DEBUG` | `0` | 設為 `1` 時回應加入 `x-zen-key-index` |

> 標頭註記：代理預設會附加 `x-opencode-client` 與自訂 `User-Agent`。這是本專案代理的可設定行為；是否為各上游方案要求，請以該服務官方文件為準。

---

## 測試

```bash
npm test
```

測試會啟動 mock upstream 與本地代理，驗證健康端點、標頭、金鑰附帶、`429` 原地重試、`401` 失效標記與熱重載。

---

## Prompts

各後端設定提示詞位於 [`prompts/`](prompts/)：

- [All-in-One Master Prompt](prompts/all-in-one-setup.md)
- [OpenCode Zen](prompts/setup-opencode-zen.md)
- [Mistral Codestral](prompts/setup-mistral-codestral.md)
- [Google Gemini](prompts/setup-gemini-free.md)
- [OpenRouter Free](prompts/setup-openrouter-free.md)
- [NVIDIA NIM](prompts/setup-nvidia-nim.md)
- [DeepSeek Harness](prompts/setup-deepseek-harness.md)
- [OpenManus](prompts/setup-openmanus.md)
- [GLM Coding Plan](prompts/setup-glm-coding-plan.md)
- [GitHub Models（已退役，僅留紀錄）](prompts/setup-github-models.md)

---

## 使用提醒

- 免費或平價 API 的方案、額度、模型清單與服務條款都會變動；不要相信 repo 內的數字，直接看官方頁面。
- 多帳號、多 KEY 或模擬特定客戶端標頭可能涉及上游服務條款，使用者需自行確認與承擔風險。
- 免費層常保留資料訓練權限；請不要把未公開商業代碼或個人敏感資料送進免費模型。

## License

MIT License，詳見 [`LICENSE`](LICENSE)。
