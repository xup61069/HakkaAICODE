# OpenManus（開源版 Manus）本機配置提示詞

[OpenManus](https://github.com/mannaandpoem/OpenManus) 是社群打造的 Manus 開源替代方案，具備**全自動多步規劃、網路搜尋、瀏覽器操作（Browser-Use）、代碼撰寫與終端機執行**能力的通用 Agent。

只要串接 HakkaAICODE 本地代理或任何免費 API，就能在自己的電腦上免費跑 Manus 等級的自主代理！

---

## 複製以下提示詞：

```text
請幫我將這台電腦配置好 OpenManus（開源自主 AI Agent），並將其模型後端對接至免費/平價 API。

請自動完成以下項目：
1. 檢查本機 Python 3.11+ 與 Git 環境，將 OpenManus 倉庫 clone 至使用者目錄下的 OpenManus 資料夾：
   git clone https://github.com/mannaandpoem/OpenManus.git "$HOME/OpenManus"
2. 建立虛擬環境並安裝依賴（pip install -r requirements.txt），若需瀏覽器功能則執行 playwright install。
3. 建立或修改 config/config.toml 設定檔，根據我的需求配置 LLM 後端（可選以下任一）：
   - 【客家代理 (OpenCode Zen)】:
     * base_url = "http://127.0.0.1:15722/v1"
     * api_key = "隨意填寫或 Zen Key"
     * model = "執行 node scripts/check-models.js 查到的 -free 模型"
   - 【Mistral Codestral 免費層】:
     * base_url = "https://api.mistral.ai/v1"
     * api_key = "你的 MISTRAL_API_KEY"
     * model = "codestral-latest"
   - 【Google AI Studio (Gemini)】:
     * base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
     * api_key = "你的 GEMINI_API_KEY"
     * model = "gemini-2.5-flash"
4. 驗證配置並執行 python main.py 進行一個簡單的端到端任務測試（例如「查詢當前熱門開源 AI 專案並產出一份 Markdown 報告」）。
5. 不要把我的金鑰寫進任何公開檔案。
```

---

## 備註
- **什麼是 Manus 模式**：不同於單純的代碼補全，Manus / OpenManus 是「給定目標後，自己搜尋、自己寫程式、自己執行除錯直到目標達成」的全自動通用 Agent。
- **推薦模型**：執行複雜 Agent 任務強烈推薦挑選具備強大 Tool Calling 與 Reasoning 能力的模型（如 Claude 3.7 / DeepSeek R1 / Gemini 2.5 Flash / Codestral）。
