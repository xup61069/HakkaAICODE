# Google AI Studio (Gemini) 免費層配置提示詞（v2 修正版）

Google AI Studio 提供免費層 API。⚠️ 注意：**免費層的對話資料會被 Google 用於改進產品（訓練）**，敏感專案請勿使用免費層。

> 額度說明：Gemini 免費層額度依模型而異且經常調整（例如 Flash 系列曾有每日 20～1,500 次請求的版本），**請一律以 https://ai.google.dev/gemini-api/docs/rate-limits 當下數字為準**，不要相信任何文章寫死的數字（包括本文件）。

---

## 複製以下提示詞：

```text
請幫我將這台電腦的 AI coding 環境（Claude Code / Codex / opencode / Roo Code）設定為使用 Google AI Studio (Gemini) 的免費 API 後端。

GEMINI_API_KEY=你的 GEMINI API KEY（至 https://aistudio.google.com/app/apikey 免費申請）

請自動完成以下項目：
1. 若尚未取得金鑰，請引導我至 https://aistudio.google.com/app/apikey 點擊 "Create API Key" 免費建立。
2. 協助我在 CC Switch 或環境變數中設定相容 OpenAI 協定的 Gemini Provider：
   - Base URL: https://generativelanguage.googleapis.com/v1beta/openai/
   - API Key: (我所提供的 GEMINI_API_KEY)
3. 呼叫 GET https://generativelanguage.googleapis.com/v1beta/models?key=金鑰 列出當下可用模型，從中挑選：
   - 主力：最新的 gemini-*-flash（如 gemini-3.7-flash，速度與額度平衡）
   - 大上下文備案：最新的 gemini-*-pro（如 gemini-3.7-pro，1M+ context，適合整專案重構）
   不要寫死舊型號，以 API 實際回傳為準。
4. 發送測試請求驗證連線，列出生效配置與該模型當下的免費層額度（從官方 rate-limits 頁面確認）。
5. 提醒我：免費層資料會被 Google 用於訓練；不要把我的金鑰寫進任何公開檔案。
```

---

## 備註
- Gemini 的強項是**超大 context（1M+ tokens）**，適合整個 repo 重構、長文件分析這類其他免費層吃不下的任務。
- 台灣可直接使用 AI Studio，免信用卡。
