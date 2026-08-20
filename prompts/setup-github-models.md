# GitHub Models 免費額度配置提示詞

GitHub 提供開發者透過 GitHub Personal Access Token (PAT) 免費使用 GitHub Models 上的前沿模型（包括 GPT-4o、Claude 3.5 Sonnet、Llama 等）。

---

## 複製以下提示詞：

```text
請幫我將這台電腦的 AI coding 環境（Claude Code / Codex）設定為使用 GitHub Models 的免費額度後端。

GITHUB_TOKEN=你的 GITHUB 個人存取權杖 (至 https://github.com/settings/tokens 申請)

請自動完成以下項目：
1. 若尚未提供權杖，請引導我開啟 https://github.com/settings/tokens 建立具備基本存取權限的 Personal Access Token。
2. 協助我在 CC Switch 或環境變數中設定 GitHub Models Provider：
   - Base URL: https://models.inference.ai.azure.com
   - API Key: (我所提供的 GITHUB_TOKEN)
   - 常用模型:
     * gpt-4o
     * gpt-4o-mini
     * Meta-Llama-3.1-70B-Instruct
     * Mistral-large-2407
3. 驗證連線是否正常，並列出設定摘要。
```
