# OpenManus 設定提示詞

官方 repo：<https://github.com/FoundationAgents/OpenManus>

OpenManus 的專案位置後來移轉到 `FoundationAgents/OpenManus`；`mannaandpoem/OpenManus` 只是歷史位置，不要照舊路徑 clone。安裝方式與支援的 Python 版本請以官方 repo README 為準。

## 複製以下提示詞

```text
請幫我將這台電腦配置好 OpenManus，並把模型後端對接至免費/平價 API。

請自動完成以下項目：
1. 讀 https://github.com/FoundationAgents/OpenManus 的 README，確認目前安裝方式、Python 版本與啟動指令。
2. 依官方文件將專案 clone 到使用者目錄並安裝依賴。
3. 依官方文件建立或修改設定檔，設定 LLM Provider；Base URL、API Key 與 Model 以該後端官方文件與 API 實測為準。
4. 若使用本專案代理，可設定 Base URL 為 http://127.0.0.1:15722/v1，模型用 node scripts/check-models.js 查詢。
5. 執行一個最小測試任務驗證連線。
6. 不要把我的金鑰寫進任何公開檔案。
```

## 備註

- 開源 Agent 常具備終端與檔案操作能力，請在獨立專案目錄或虛擬環境中運行。
- 推薦模型與版本請以官方 repo 和該模型供應商文件為準。
