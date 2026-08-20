# Google AI Studio (Gemini) 免費層設定提示詞

官方文件：<https://ai.google.dev/gemini-api/docs>
額度頁面：<https://ai.google.dev/gemini-api/docs/rate-limits>

免費層額度依模型與地區而異，且會調整；請以官方 rate limits 頁面為準，不要寫死任何模型名稱。

## 複製以下提示詞

```text
請幫我將這台電腦的 AI coding 環境（Claude Code / Codex / opencode / Roo Code）設定為使用 Google AI Studio (Gemini) 的免費 API 後端。

GEMINI_API_KEY=你的 GEMINI API KEY（至 https://aistudio.google.com/app/apikey 免費申請）

請自動完成以下項目：
1. 若尚未取得金鑰，請引導我至 https://aistudio.google.com/app/apikey 建立 API Key。
2. 讀 https://ai.google.dev/gemini-api/docs 確認目前 OpenAI 相容端點與 API 版本。
3. 在 CC Switch 或環境變數中新增 Provider，端點與模型以官方文件為準。
4. 呼叫官方 models API 列出目前可用模型，從中挑選適合 coding agent 的模型（支援 function calling、context 夠長、目前有免費額度），不要寫死型號。
5. 發送測試請求驗證連線，並到官方 rate limits 頁面確認目前免費額度。
6. 提醒我免費層的資料政策；不要把我的金鑰寫進任何公開檔案。
```

## 備註

- Google AI Studio 的強項是超大 context，適合整包專案重構。
- 台灣可直接使用 AI Studio；註冊與額度細節以官方頁面為準。
