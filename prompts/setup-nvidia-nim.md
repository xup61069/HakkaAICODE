# NVIDIA NIM 設定提示詞

官方入口：<https://build.nvidia.com/>

免費額度、需要的前提與可用模型都會變動，請以官方頁面為準。

## 複製以下提示詞

```text
請幫我將這台電腦的 AI coding 環境（Claude Code / Codex / opencode / Roo Code）設定為使用 NVIDIA NIM 的 API 後端。

NVIDIA_API_KEY=你的 NVIDIA API KEY（至 https://build.nvidia.com/ 取得）

請自動完成以下項目：
1. 若尚未取得金鑰，請引導我開啟 https://build.nvidia.com/ 註冊並依官方流程取得 API Key。
2. 讀官方頁面確認目前免費額度、端點與模型清單。
3. 在 CC Switch 或環境變數中新增 NVIDIA NIM Provider，端點與模型以官方文件為準。
4. 呼叫官方 models API 列出目前可用模型，優先挑選支援 tool/function calling 與長 context 的模型；不要寫死型號。
5. 發送測試請求驗證連線。
6. 不要把我的金鑰寫進 repo、log 或任何公開檔案。
```

## 備註

- 註冊可能要求手機驗證或其他條件，以官方流程為準。
- 免費額度不保證能支撐高併發批次任務。
