# OpenRouter Free 模式自動配置提示詞

OpenRouter 提供多款完全免費（`:free` 標籤）的模型（如 DeepSeek V3/R1、Qwen 2.5 等）。

> 💡 **隱藏技巧**：帳號只要一次性儲值 $10（餘額可永久留存），每日免費額度上限會從 50 req/day 直接大幅提升至 1,000 req/day！

---

## 複製以下提示詞：

```text
請幫我將這台電腦的 AI coding 環境（Claude Code / Codex / Roo Code）設定為使用 OpenRouter 的免費模型後端。

OPENROUTER_API_KEY=你的 OPENROUTER API KEY (至 https://openrouter.ai/keys 免費申請)

請自動完成以下項目：
1. 若尚未取得金鑰，請引導我開啟 https://openrouter.ai/keys 建立一組 API Key。
2. 協助我在 CC Switch 或環境變數中新增 OpenRouter Provider：
   - Base URL: https://openrouter.ai/api/v1
   - API Key: (我所提供的金鑰)
   - 推薦免費模型:
     * deepseek/deepseek-chat:free
     * deepseek/deepseek-r1:free
     * qwen/qwen-2.5-coder-32b-instruct:free
     * meta-llama/llama-3.3-70b-instruct:free
3. 請確保請求標頭包含 HTTP-Referer 與 X-Title（以便 OpenRouter 統計與最佳化配額）。
4. 驗證連線是否正常，並列出當前設定與生效模型。
```
