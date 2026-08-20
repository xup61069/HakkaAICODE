# 免費與平價 AI Coding 資源指南

本指南只提供可前往官方頁面查證的入口，不列出容易過時或未必正確的「額度數據」。

各平台的政策差異很大，而且會變動。請以官方頁面當下內容為準。

---

## 官方入口

| 平台 | 用途 | 官方頁面 |
| :--- | :--- | :--- |
| OpenCode Zen | OpenCode 官方模型 Gateway | <https://opencode.ai/docs/zen/> |
| Mistral Codestral | 程式碼取向模型 | <https://docs.mistral.ai/> |
| Google AI Studio | Gemini API 免費層與額度 | <https://ai.google.dev/gemini-api/docs> |
| OpenRouter | 多模型聚合入口 | <https://openrouter.ai/docs> |
| NVIDIA NIM | 托管開源模型推論 | <https://build.nvidia.com/> |
| CC Switch | AI Provider 管理與切換 | <https://github.com/farion1231/cc-switch/releases> |

---

## 查證建議

1. 先到上述官方頁面確認該服務目前是否提供免費額度。
2. 確認註冊條件（例如是否要信用卡、手機驗證、企業信箱）。
3. 確認免費層是否可用於 coding agent（例如模型是否有 function calling、context 長度是否足夠）。
4. 確認資料保留與訓練政策，尤其不要送未公開商業代碼或個人敏感資料。

---

## 本專案相關提示詞

每個後端的設定提示詞在 [`prompts/`](../prompts/)：

- [Mistral Codestral](../prompts/setup-mistral-codestral.md)
- [Google Gemini](../prompts/setup-gemini-free.md)
- [OpenRouter Free](../prompts/setup-openrouter-free.md)
- [NVIDIA NIM](../prompts/setup-nvidia-nim.md)

提示詞內不應該寫死型號或額度；若你看到寫死數字，請以官方頁面取代。
