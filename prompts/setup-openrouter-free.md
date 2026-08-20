# OpenRouter Free 模式自動配置提示詞（v2 修正版）

OpenRouter 提供多款 `:free` 後綴的免費模型。免費額度：**每日 50 次請求、約 20 RPM**；**儲值 $10（終身一次性）即可升級為每日 1,000 次**，是免費黨最值得花的小錢。

> ⚠️ 免費模型的對話資料可能被上游用於訓練，敏感程式碼請改用付費模型。

---

## 複製以下提示詞：

```text
請幫我將這台電腦的 AI coding 環境（Claude Code / Codex / opencode / Roo Code）設定為使用 OpenRouter 的免費模型後端。

OPENROUTER_API_KEY=你的 OPENROUTER API KEY（至 https://openrouter.ai/keys 免費申請）

請自動完成以下項目：
1. 若尚未取得金鑰，請引導我開啟 https://openrouter.ai/keys 建立一組 API Key。
2. 協助我在 CC Switch 或環境變數中新增 OpenRouter Provider：
   - Base URL: https://openrouter.ai/api/v1
   - API Key: (我所提供的金鑰)
3. 呼叫 GET https://openrouter.ai/api/v1/models，篩選 id 以 ":free" 結尾、且支援 tool use / function calling 的模型（coding agent 需要工具呼叫能力），列出前 5 名讓我挑選。
   - 不要寫死模型 ID：:free 清單替換很快，過去下架過 llama-3.3-70b、qwen-2.5-coder 等。
4. 請確保請求標頭包含 HTTP-Referer 與 X-Title（OpenRouter 用於統計與配額計算）。
5. 發送一個測試請求驗證連線，並列出當前設定與生效模型。
6. 不要把我的金鑰寫進 repo、log 或任何公開檔案。
```

---

## 備註
- **額度升級技巧**：在 https://openrouter.ai/credits 儲值 $10，免費模型額度終身從 50 次/日升到 1,000 次/日，不用訂閱。
- **尖峰時段**免費池會排隊或回 429，建議搭配 Google AI Studio 免費層當第二備援。
- 模型挑選時優先看：context window ≥ 128k、支援 tools、近期更新的版本。
