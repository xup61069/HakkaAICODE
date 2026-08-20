# OpenRouter Free 模式設定提示詞

官方文件：<https://openrouter.ai/docs>

免費額度、每日請求數與付費升級條件都會變動，請以官方頁面當下內容為準。

## 複製以下提示詞

```text
請幫我將這台電腦的 AI coding 環境（Claude Code / Codex / opencode / Roo Code）設定為使用 OpenRouter 的免費模型後端。

OPENROUTER_API_KEY=你的 OPENROUTER API KEY（至 https://openrouter.ai/keys 申請）

請自動完成以下項目：
1. 若尚未取得金鑰，請引導我開啟 https://openrouter.ai/keys 建立 API Key。
2. 讀 https://openrouter.ai/docs 確認目前免費模型的額度政策與付費升級條件。
3. 協助我在 CC Switch 或環境變數中新增 OpenRouter Provider：
   - Base URL: https://openrouter.ai/api/v1
   - API Key: (我所提供的金鑰)
4. 呼叫 GET https://openrouter.ai/api/v1/models，篩選 id 以 ":free" 結尾且支援 tool use / function calling 的模型，列出前 5 名讓我挑選；不要寫死型號。
5. 依 OpenRouter 官方文件設定 HTTP-Referer 與 X-Title 標頭。
6. 發送一個測試請求驗證連線，並列出目前設定。
7. 不要把我的金鑰寫進 repo、log 或任何公開檔案。
```

## 備註

- 若官方文件有提供免費額度升級條件，以官方文件為準，不要相信舊文章寫死的次數。
- 免費池可能排隊或回 `429`，請把其他官方免費層當作備援。
