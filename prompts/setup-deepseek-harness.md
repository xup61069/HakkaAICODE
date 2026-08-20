# DeepSeek Harness (dsh) 本機啟動與配置提示詞

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（簡稱 **dsh**）是 DeepSeek 官方於 2026 年 8 月開源的**模組化 Agent 運行環境與工作台（Workbench）**。

基於 Cordis 微內核設計（「Everything is a Plugin」），支援 Web 視覺化界面、軌跡重放、工具掛載與終端指令執行。可直接串接 HakkaAICODE 本地免費代理、DeepSeek 官方 API 或任何 OpenAI 相容後端！

---

## ⚡ 一鍵啟動指令（免安裝）

確保本機已安裝 Node.js（建議 Node 22+），在終端機直接執行：

```bash
npx @deepseek-ai/dsh web
```
啟動後開啟瀏覽器存取 `http://127.0.0.1:3080` 即可進入視覺化工作台。

---

## 📋 複製以下提示詞（Agent 自動化配置）：

```text
請幫我將這台電腦配置好 DeepSeek Harness (dsh)，並將其模型後端對接至免費/平價 API。

請自動完成以下項目：
1. 檢查本機 Node.js (v22+) 與 npm 環境。
2. 在本機目錄建立或設定 dsh 的設定檔（位於 ~/.dsh/config.json 或專案 config），配置 LLM Provider：
   - 【客家代理 (OpenCode Zen)】:
     * Base URL: http://127.0.0.1:15722/v1
     * API Key: 隨意填寫（Proxy 會自動注入）
     * Model: 執行 node scripts/check-models.js 查得之 -free 模型
   - 【DeepSeek 官方 API（高性價比主力）】:
     * Base URL: https://api.deepseek.com/v1
     * API Key: 你的 DEEPSEEK_API_KEY
     * Model: deepseek-chat (V3) 或 deepseek-reasoner (R1)
   - 【Mistral Codestral 免費層】:
     * Base URL: https://api.mistral.ai/v1
     * API Key: 你的 MISTRAL_API_KEY
     * Model: codestral-latest
3. 協助建立啟動腳本或背景服務（npx @deepseek-ai/dsh web），確認 http://127.0.0.1:3080 能正常載入。
4. 在 dsh 中執行一個測試任務（例如「掃描當前專案結構並產生一份架構分析圖」）驗證連線。
5. 不要把我的金鑰寫進任何公開檔案。
```

---

## 🌟 核心特色
- **Everything is a Plugin**：模型、沙盒（Sandbox）、工具註冊、審批策略、工作階段日誌皆為獨立外掛。
- **可追溯性與可重放**：所有 Agent 決策與軌跡均記錄在 Append-only 日誌中，支援中斷恢復（Resume）與時間線分叉（Fork）。
- **安全提醒**：dsh 具備終端與檔案操作權限，建議在獨立專案目錄或虛擬環境中運行。
