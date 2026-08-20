# OpenCode Zen 設定提示詞

官方文件：<https://opencode.ai/docs/zen/>

> 提示詞的目的不是寫死任何額度或型號，而是讓 Agent 先讀官方文件，再用本專案代理設定本機環境。

## 複製以下提示詞

```text
請依照 https://opencode.ai/docs/zen/ 與 https://github.com/xup61069/HakkaAICODE 的指引，把這台電腦設定為使用 OpenCode Zen 後端。

請自動完成以下項目：
1. 先讀 OpenCode Zen 官方文件，確認目前的登入方式、API key 是否必填、模型清單端點與可用模型。
2. 若本機尚未安裝 CC Switch（https://github.com/farion1231/cc-switch/releases），請下載並安裝最新版。
3. 使用本專案的 scripts/server-multikey.js 啟動本機代理：
   - Base URL: http://127.0.0.1:15722/v1
   - 若官方文件要求 API key，且我提供金鑰，請寫入 %USERPROFILE%\HakkaAICODE\zen-keys.txt（一行一把，不要 commit）。
4. 執行 node scripts/check-models.js 查詢目前可用的模型，不要寫死任何型號。
5. 依我目前使用的 Agent（Claude Code / Codex / Roo Code 等）設定 Provider，並用一個測試請求驗證連線。
6. 不要把我提供的金鑰寫進 repo、log 或任何公開檔案。
7. 完成後回報：官方文件目前對 API key 與免費額度的說法、代理健康狀態、啟用模型與設定檔位置。
```

## 注意事項

- 官方文件說 API key 是選填，但「選填」的實際意涵請以文件當下內容為準。
- 本機代理預設附加自訂標頭；若你不想使用這些標頭，可用環境變數關閉或修改。
- 多 KEY 輪換不保證突破上游總量限制；遇到 `429` 時請依官方政策處理。
