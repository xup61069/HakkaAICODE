# 2026 免費與平價 AI Coding 資源指南

本文件整理可用於輔助程式開發、相容於 Claude Code / Codex / CC Switch / Roo Code / Cursor / Cline 等工具的合法免費或高性價比後端方案。

> ⚠️ **隱私與安全警語**：  
> 多數免費層（包括 OpenCode Zen、OpenRouter 免費模型等）在服務條款中可能保有將 Prompt 與代碼用於模型改進與訓練的權利。**請勿將商業機密、金鑰密碼或敏感個資送往免費公共端點。**

---

## 方案總覽矩陣

| 平台 / 提供者 | 免費層額度與特點 | 推薦模型 | 端點 Base URL | 注意事項與攻略 |
| :--- | :--- | :--- | :--- | :--- |
| **Mistral Codestral** 🔥 | 30 RPM / 每日約 2,000 次請求 | `codestral-latest` | `https://codestral.mistral.ai/v1` | **專為程式碼設計的頂級免費 API**，需至 Mistral Console 申請 Codestral專用 Key |
| **OpenCode Zen** | 每日約 100 次請求（免綁卡） | 請執行 `node scripts/check-models.js` 查詢即時 `-free` 清單 | `http://127.0.0.1:15722/v1`<br>*(經由客家代理)* | 需透過 `zen-header-injector` 補上標頭；支援多 KEY 自動熱重載與原地無感重試 |
| **Google AI Studio** | 充裕個人 Free Tier (以官方為準) | `gemini-2.5-flash`<br>`gemini-2.5-flash-lite` | `https://generativelanguage.googleapis.com/v1beta/openai/` | 原生 OpenAI 相容協定，上下文視窗極大 (1M+ tokens)，速度極快 |
| **GitHub Models** | 整合於 GitHub 個人帳號 | `gpt-4o`<br>`gpt-4o-mini`<br>`Meta-Llama-3.3-70B-Instruct`<br>`DeepSeek-R1` | `https://models.github.ai/inference` | 登入 GitHub 即可使用 PAT Token 呼叫，每日有速率限制（不提供 Anthropic 模型） |
| **NVIDIA NIM** | 約 40 RPM 免費推論配額 | `meta/llama-3.3-70b-instruct`<br>`deepseek-ai/deepseek-r1` | `https://integrate.api.nvidia.com/v1` | 需手機註冊驗證，模型選擇多、速度穩定 |
| **OpenRouter Free** | 免費 `:free` 社群模型 | `deepseek/deepseek-chat:free`<br>`deepseek/deepseek-r1:free`<br>`qwen/qwen-2.5-coder-32b-instruct:free` | `https://openrouter.ai/api/v1` | **儲值 $10 技巧**：一次性儲值 $10 終身將免費模型額度自 50 req/day 提升至 1,000 req/day |
| **Groq Cloud** | 極速推論免費層 | `llama-3.3-70b-versatile`<br>`deepseek-r1-distill-llama-70b` | `https://api.groq.com/openai/v1` | 超高 TPS 輸出速度，適合即時補全與語法檢查 |

---

## 1. Mistral Codestral 免費 API (強力推薦)
- **取得 API Key**: 前往 [https://console.mistral.ai/codestral](https://console.mistral.ai/codestral) 免費申請。
- **特點**: 32k 上下文，專門針對 80+ 種程式語言進行代碼補全、生成與 FIM (Fill-in-the-Middle) 優化。
- **在 CC Switch 中設定**:
  - **Base URL**: `https://codestral.mistral.ai/v1`
  - **API Key**: 你的 Codestral Key
  - **Model ID**: `codestral-latest`

---

## 2. OpenCode Zen 免費模型
- **取得認證**: 透過 `opencode auth login` 或至 [https://opencode.ai](https://opencode.ai) 取得。
- **架構優勢**: 搭配本專案 `server-multikey.js`，可將多把 Key 存入 `zen-keys.txt`，遭遇 429/401 自動在 Proxy 內部原地重試。
- **即時模型檢測**:
  ```bash
  node scripts/check-models.js
  ```

---

## 3. GitHub Models (遷移至新端點)
- **Base URL**: `https://models.github.ai/inference` (⚠️ 舊版 `models.inference.ai.azure.com` 已棄用)
- **取得 PAT Token**: 前往 [https://github.com/settings/tokens](https://github.com/settings/tokens)。
- **目錄說明**: GitHub Models 提供 OpenAI、Meta、Mistral、DeepSeek 等模型，未上架 Anthropic Claude 模型。

---

## 4. 超平價 Overflow 備援方案（當免費池用盡時）

若免費額度皆已耗盡，以下為極低成本的平價備援方案：

1. **DeepSeek API (官方直連)**:
   - DeepSeek V3/V4: 每百萬 Tokens 約 $0.14 ~ $0.28 美元（快取命中僅 $0.014 起），性價比極高。
2. **智譜 GLM Coding Plan**:
   - 專門為 Coding Agent 設計的訂閱制方案，提供 5 小時滾動重置配額，穩定無斷流之憂。
3. **OpenRouter 儲值 $10 升級方案**:
   - 僅需儲值 $10（餘額保留），即可將全站 `:free` 模型的每日呼叫上限提升至 1,000 次。
