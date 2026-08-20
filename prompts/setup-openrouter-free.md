# OpenRouter Free 模式自動配置提示詞

OpenRouter 提供多款完全免費（`:free` 標籤）的大型語言模型（如 DeepSeek V3/R1、Meta LLaMA 3.3 70B、Qwen 2.5 等）。

---

## 複製以下提示詞：

```text
請幫我將這台電腦的 AI coding 環境（Claude Code / Codex）設定為使用 OpenRouter 的免費模型後端。

OPENROUTER_API_KEY=你的 OPENROUTER API KEY (至 https://openrouter.ai/keys 免費申請)

請自動完成以下項目：
1. 若尚未取得金鑰，請引導我開啟 https://openrouter.ai/keys 建立一組 API Key。
2. 協助我在 CC Switch 或環境變數中新增 OpenRouter Provider：
   - Base URL: https://openrouter.ai/api/v1
   - API Key: (我所提供的金鑰)
   - 推薦免費模型:
     * deepseek/deepseek-chat:free
     * deepseek/deepseek-r1:free
     * meta-llama/llama-3.3-70b-instruct:free
     * qwen/qwen-2.5-coder-32b-instruct:free
3. 請確保請求標頭包含 HTTP-Referer 與 X-Title（以便 OpenRouter 統計與最佳化配額）。
4. 驗證連線是否正常，並列出當前設定與生效模型。
```

---

## 常用免費模型代號
- `deepseek/deepseek-chat:free` - DeepSeek V3 旗艦通用模型
- `deepseek/deepseek-r1:free` - DeepSeek R1 深度思考推理模型
- `meta-llama/llama-3.3-70b-instruct:free` - Meta 開源旗艦指令模型
- `qwen/qwen-2.5-coder-32b-instruct:free` - 通義千問強大代碼模型
