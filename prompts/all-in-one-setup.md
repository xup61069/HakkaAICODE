# All-in-One 自動配置提示詞

這個提示詞讓 Agent 依照你提供的金鑰與各平台官方文件，自動配置最適合目前的後端。不要寫死型號與額度。

## 複製以下提示詞

```text
請依照 https://github.com/xup61069/HakkaAICODE 的指引，為我這台電腦配置可用的 AI coding 後端。

【我的金鑰（沒有就留空）】：
- OPEN_CODE_ZEN_KEY=
- MISTRAL_API_KEY=
- DEEPSEEK_API_KEY=
- OPENROUTER_API_KEY=
- GEMINI_API_KEY=
- NVIDIA_API_KEY=
- ZAI_API_KEY=

請依照以下流程：
1. 檢查本機 Node.js、Git 與 CC Switch（https://github.com/farion1231/cc-switch/releases）是否可用。
2. 對於我有提供金鑰的平台，先讀該平台官方文件確認目前端點、模型清單與額度政策：
   - OpenCode Zen: https://opencode.ai/docs/zen/
   - Mistral: https://docs.mistral.ai/
   - DeepSeek: https://api-docs.deepseek.com/
   - OpenRouter: https://openrouter.ai/docs
   - Google AI Studio: https://ai.google.dev/gemini-api/docs
   - NVIDIA NIM: https://build.nvidia.com/
   - Z.ai: https://docs.z.ai/
3. 使用官方文件與 API 實測取得的模型清單，不要寫死型號。
4. 若選擇 OpenCode Zen，可用本專案 scripts/server-multikey.js 啟動 http://127.0.0.1:15722/v1 代理；其他平台直接設定官方端點。
5. 測試連線，確認我能用指定的 Agent 完成一個最小請求。
6. 不要把金鑰寫進 repo、log 或任何公開檔案。
7. 完成後回報每個平台的官方文件摘要、啟用端點、啟用模型與設定檔位置。
```

## 平台速查

| 平台 | 官方文件 |
| :--- | :--- |
| OpenCode Zen | <https://opencode.ai/docs/zen/> |
| Mistral Codestral | <https://docs.mistral.ai/> |
| DeepSeek | <https://api-docs.deepseek.com/> |
| OpenRouter | <https://openrouter.ai/docs> |
| Google AI Studio | <https://ai.google.dev/gemini-api/docs> |
| NVIDIA NIM | <https://build.nvidia.com/> |
| Z.ai | <https://docs.z.ai/> |
