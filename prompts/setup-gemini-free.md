# Google AI Studio (Gemini) 免費層配置提示詞

Google AI Studio 提供極具性價比且配額充裕的免費層 API（包含 Gemini 2.5 Flash、Flash Lite 等）。

---

## 複製以下提示詞：

```text
請幫我將這台電腦的 AI coding 環境（Claude Code / Codex）設定為使用 Google AI Studio (Gemini) 的免費 API 後端。

GEMINI_API_KEY=你的 GEMINI API KEY (至 https://aistudio.google.com/app/apikey 免費申請)

請自動完成以下項目：
1. 若尚未取得金鑰，請引導我至 https://aistudio.google.com/app/apikey 點擊 "Get API Key" 免費建立金鑰。
2. 協助我在 CC Switch 或環境變數中設定相容 OpenAI 的 Gemini 端點 Provider：
   - Base URL: https://generativelanguage.googleapis.com/v1beta/openai/
   - API Key: (我所提供的 GEMINI_API_KEY)
   - 推薦模型:
     * gemini-2.5-flash
     * gemini-2.5-flash-lite
3. 驗證連線是否正常，並列出生效配置。
```
