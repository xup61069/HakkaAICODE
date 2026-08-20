# 2026 免費與平價 AI Coding 資源指南

本文件整理當前可用於輔助程式開發、相容於 Claude Code / Codex / CC Switch / Aider / Cursor / Cline 等工具的合法免費或高性價比後端方案。

---

## 方案總覽矩陣

| 平台 / 提供者 | 免費層特點 | 推薦模型 | 端點 Base URL | 特點與注意事項 |
| :--- | :--- | :--- | :--- | :--- |
| **OpenCode Zen** | 官方社群免費額度 | `deepseek-v4-flash-free`<br>`mimo-v2.5-free`<br>`nemotron-3.5-lightning-free` | `http://127.0.0.1:15722/v1`<br>*(經由客家代理)* | 需透過本專案之 `zen-header-injector` 補上標頭；支援多 KEY 自動輪換與熱重載 |
| **OpenRouter** | 豐富的 `:free` 社群模型 | `deepseek/deepseek-chat:free`<br>`deepseek/deepseek-r1:free`<br>`meta-llama/llama-3.3-70b-instruct:free` | `https://openrouter.ai/api/v1` | 免費模型齊全，全球開發者共用配額，尖峰時段可能有排隊延遲 |
| **Google AI Studio** | 充裕的個人 Free Tier | `gemini-2.5-flash`<br>`gemini-2.5-flash-lite` | `https://generativelanguage.googleapis.com/v1beta/openai/` | 原生支援 OpenAI 相容協定，上下文視窗極大 (1M+ tokens)，速度極快 |
| **GitHub Models** | 整合於 GitHub 帳戶 | `gpt-4o`<br>`gpt-4o-mini`<br>`Meta-Llama-3.1-70B-Instruct` | `https://models.inference.ai.azure.com` | 用戶登入 GitHub 即可使用 Personal Access Token (PAT) 呼叫，每日有速率限制 |
| **Groq Cloud** | 極速推論免費層 | `llama-3.3-70b-versatile`<br>`deepseek-r1-distill-llama-70b` | `https://api.groq.com/openai/v1` | 每秒數百 Token 輸出速度，適合注重速度的自動補全或即時問答 |
| **Cloudflare Workers AI** | 每日 10,000 神經元免費額度 | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Cloudflare 專用 Gateway / REST | 適合部署無伺服器微服務或小型輕量腳本自動化 |

---

## 1. OpenCode Zen 免費模型 (客家推薦)
- **取得 API Key**: 前往 [https://opencode.ai/auth](https://opencode.ai/auth) 登入並取得 Key。
- **架構優勢**: 搭配本專案的 `server-multikey.js`，可將多把 Key 存入 `zen-keys.txt`，遇 429 自動冷卻並輪換下一把。
- **即時模型檢測**:
  ```bash
  node scripts/check-models.js
  ```

---

## 2. OpenRouter `:free` 模型
- **取得 API Key**: 前往 [https://openrouter.ai/keys](https://openrouter.ai/keys) 免費建立。
- **在 CC Switch 中設定**:
  - **Base URL**: `https://openrouter.ai/api/v1`
  - **API Key**: `sk-or-v1-...`
  - **Model ID**: `deepseek/deepseek-chat:free` 或 `meta-llama/llama-3.3-70b-instruct:free`

---

## 3. Google AI Studio (Gemini)
- **取得 API Key**: 前往 [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)。
- **在 CC Switch 中設定 (OpenAI 相容模式)**:
  - **Base URL**: `https://generativelanguage.googleapis.com/v1beta/openai/`
  - **API Key**: 貼上 Google API Key
  - **Model ID**: `gemini-2.5-flash`

---

## 4. GitHub Models (Azure AI Inference)
- **取得 PAT Token**: 前往 [https://github.com/settings/tokens](https://github.com/settings/tokens) 建立 Token。
- **在 CC Switch 中設定**:
  - **Base URL**: `https://models.inference.ai.azure.com`
  - **API Key**: 貼上 GitHub Token
  - **Model ID**: `gpt-4o`

---

## 輪換與節省技巧 (客家心法)

1. **先用免費池，再切個人 Key**：平時可用 OpenCode Zen 多 Key 輪換或 OpenRouter `:free` 作為主要打底模型。
2. **長文本與重構**：遇需要大上下文（例如整個專案重構）時切至 Google Gemini 2.5 Flash 免費層。
3. **推理與難題**：遇到演算法瓶頸切換至 DeepSeek R1 深度思考模型。
4. **安全原則**：各家 API 金鑰切勿上傳公開 GitHub Repo，善用本機 `.gitignore` 與環境變數。
