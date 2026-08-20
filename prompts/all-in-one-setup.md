# 🍜 客家 AICODE 全能整合式自動配置提示詞（All-in-One Master Prompt）

只需將下方這一段**大師提示詞 (Master Prompt)** 貼給任何 AI Coding Agent（**Claude Code**、**Codex**、**Google Antigravity**、**Roo Code / Cline**、**DeepSeek Harness (dsh)** 或 **OpenManus**），Agent 會自動根據你提供的金鑰（或引導你領取免費額度），將你的開發環境設定為最佳的免費/平價 AI 後端！

---

## 📋 複製以下全能提示詞：

```text
請依照 https://github.com/xup61069/HakkaAICODE 的指引，為我這台電腦自動配置最佳的 AI Coding 免費/平價後端環境。

【我的金鑰/帳號資訊（有的話請填入，沒有請留空，Agent 會自動引導或挑選可用免費路線）】：
- OPEN_CODE_ZEN_KEY=
- OPEN_CODE_ZEN_KEYS=（多把 Zen key 請一行一把）
- DEEPSEEK_API_KEY=
- MISTRAL_API_KEY=
- OPENROUTER_API_KEY=
- GEMINI_API_KEY=
- NVIDIA_API_KEY=
- ZAI_API_KEY=

請依照以下流程自動為我完成配置：
1. 【環境與工具檢查】：
   - 檢查本機 Node.js 與 Git 環境。
   - 檢查是否安裝 CC Switch（https://github.com/farion1231/cc-switch），若無則下載並安裝最新版本。

2. 【自動選擇最優免費後端路徑】：
   - 若提供了 MISTRAL_API_KEY：優先配置 Mistral Codestral（端點: https://api.mistral.ai/v1，模型: codestral-latest，Experiment 方案提供約 1 RPS / 500k TPM 免費額度，專為代碼優化）。
   - 若提供了 DEEPSEEK_API_KEY：配置 DeepSeek 官方 API（端點: https://api.deepseek.com/v1，模型: deepseek-chat 或 deepseek-reasoner，極致性價比）。
   - 若要使用 OpenCode Zen（或已提供 Zen Key）：
     * 下載並啟動 zen-header-injector（https://github.com/xup61069/zen-header-injector），採用多 KEY 原地重試版 scripts/server-multikey.js 啟動。
     * 若有多把 Key，寫入使用者目錄下的 zen-keys.txt（不要 commit、不要外流）。
     * 執行 `node scripts/check-models.js` 查詢當下排在最前方的 -free 模型，設定 Base URL 為 http://127.0.0.1:15722/v1。
   - 若提供了 GEMINI_API_KEY：配置 Google AI Studio 端點（https://generativelanguage.googleapis.com/v1beta/openai/，超大 1M+ 上下文，適合大專案重構）。
   - 若提供了 OPENROUTER_API_KEY：配置 OpenRouter（https://openrouter.ai/api/v1），自動篩選當前支援 Tool Calling 的 :free 免費模型。
   - 若上述皆為空：先引導我註冊免費且免綁卡的 Mistral Codestral（https://console.mistral.ai/）或 OpenCode Zen（opencode auth login）。

3. 【階梯省額度策略設定】：
   - 協助我在 System Prompt 或 Agent 設定中啟用「大腦規劃 ➔ 苦工實作」分工原則、Context 瘦身建議與增量 Diff 補丁模式。

4. 【驗證與成果回報】：
   - 發送測試請求驗證連線，切勿把我的任何金鑰寫進公開檔案或 git repo。
   - 完成後列出：啟用之後端 Provider、端點 URL、生效模型、CC Switch 安裝路徑與備援切換建議。
```

---

## 🌟 支援後端特性速查

| 後端名稱 | 適用情境 | 免費/平價優勢 | 專屬獨立 Prompt |
| :--- | :--- | :--- | :--- |
| **DeepSeek Harness (dsh)** | 官方模組化 Agent 工作台 | Web UI (`npx @deepseek-ai/dsh web`)、可追溯軌跡重放 | [dsh 獨立指南](setup-deepseek-harness.md) |
| **Mistral Codestral** | 日常主力代碼編寫、補全 | 約 1 RPS (~60 RPM) / 500k TPM（代碼專用） | [Codestral 獨立指南](setup-mistral-codestral.md) |
| **OpenCode Zen** | 日常主力 Coding | 每日約 100 次，免綁卡，支援多 KEY 原地無感重試 | [Zen 獨立指南](setup-opencode-zen.md) |
| **OpenRouter Free** | 多樣化開源模型 | 儲值 $10 解鎖每日 1,000 次免費模型調用 | [OpenRouter 獨立指南](setup-openrouter-free.md) |
| **Google AI Studio** | 超大 Context / 專案重構 | 1M+ tokens 超大視窗，速度極快 | [Gemini 獨立指南](setup-gemini-free.md) |
| **NVIDIA NIM** | 開源大模型推論 | 約 40 RPM 免費推論配額 | [NIM 獨立指南](setup-nvidia-nim.md) |
| **OpenManus** | 自主通用 Agent | 全自動多步規劃 + 瀏覽器操作 + 終端執行 | [OpenManus 獨立指南](setup-openmanus.md) |
| **GLM Coding Plan** | 高頻互動吃到飽 | 5 小時滾動重置配額（$18/月起） | [GLM 獨立指南](setup-glm-coding-plan.md) |
