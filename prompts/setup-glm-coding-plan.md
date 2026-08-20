# GLM Coding Plan 設定提示詞

官方文件：<https://docs.z.ai/>

GLM Coding Plan 是 Z.ai 的付費方案，定價、額度機制與端點以官方訂閱頁和文件為準。

## 複製以下提示詞

```text
請幫我將這台電腦的 AI coding 環境設定為使用 GLM Coding Plan（Z.ai）後端。

ZAI_API_KEY=你的 Z.AI API KEY（至官方訂閱頁訂閱後取得）

請自動完成以下項目：
1. 若尚未訂閱，請引導我開啟 Z.ai 官方訂閱頁，確認目前方案、定價與額度機制。
2. 讀 https://docs.z.ai/ 確認目前 OpenAI / Anthropic 相容端點與模型名稱，不要寫死版本號。
3. 依我使用的 Agent 類型設定對應端點（例如 OpenAI 相容工具或 Claude Code 的 Anthropic 相容端點）。
4. 發送測試請求驗證連線，並查詢我方案當下的額度與重置時間。
5. 不要把我的金鑰寫進 repo、log 或任何公開檔案。
```

## 備註

- 若免費層額度不夠用，可考慮訂閱 Coding Plan，但請以官方頁面確認當前價格與方案。
