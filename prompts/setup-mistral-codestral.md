# Mistral Codestral 免費層設定提示詞

官方文件：<https://docs.mistral.ai/>

Codestral 是 Mistral 的程式碼取向模型，但免費層額度與端點會變動，請以官方文件為準。

## 複製以下提示詞

```text
請幫我將這台電腦的 AI coding 環境（Claude Code / Codex / opencode / Roo Code）設定為使用 Mistral Codestral 的 API 後端。

MISTRAL_API_KEY=你的 MISTRAL API KEY（至 https://console.mistral.ai/ 註冊）

請自動完成以下項目：
1. 若尚未取得金鑰，請引導我開啟 https://console.mistral.ai/ 註冊並建立 API Key。
2. 讀 https://docs.mistral.ai/ 確認目前可用端點、`codestral-latest` 或同等模型名稱，以及免費層額度政策。
3. 在 CC Switch 或環境變數中新增 Mistral Provider，端點與模型以官方文件為準。
4. 呼叫官方 models API 確認目前可用模型版本。
5. 發送一個程式碼生成測試請求驗證連線，並列出目前設定。
6. 不要把我的金鑰寫進 repo、log 或任何公開檔案。
```

## 備註

- 若你要接 IDE autocomplete / FIM，可能需要程式碼專用端點，以官方文件為準。
- 免費層資料可能用於訓練，敏感專案請確認官方隱私政策。
