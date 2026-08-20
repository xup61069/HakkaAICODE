# DeepSeek Harness (dsh) 設定提示詞

官方 repo：<https://github.com/deepseek-ai/deepseek-harness>

dsh 是 DeepSeek 官方的模組化 Agent 工作台，可串接 OpenAI 相容後端。安裝方式與版本以官方 repo / npm 為準。

## 一鍵啟動指令（先確認官方文件）

```bash
npx @deepseek-ai/dsh web
```

確切命令、Node.js 版本要求與預設端口請以官方 repo README 為準。

## 複製以下提示詞

```text
請幫我將這台電腦配置好 DeepSeek Harness (dsh)，並把模型後端對接到免費/平價 API。

請自動完成以下項目：
1. 讀 https://github.com/deepseek-ai/deepseek-harness 的 README，確認安裝方式、Node.js 版本與啟動指令。
2. 依官方文件建立或修改 dsh 設定檔，設定 LLM Provider；Base URL、API Key 與 Model 以該後端官方文件與 API 實測為準。
3. 若使用本專案代理，可設定 Base URL 為 http://127.0.0.1:15722/v1，模型用 node scripts/check-models.js 查詢。
4. 執行官方建議的啟動指令，確認工作台可載入。
5. 跑一個最小測試任務驗證連線。
6. 不要把我的金鑰寫進任何公開檔案。
```

## 備註

- dsh 具備終端與檔案操作能力，建議在獨立專案目錄或虛擬環境中運行。
