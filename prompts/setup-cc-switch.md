# CC Switch 多 Provider 管理工具配置提示詞（新增）

[CC Switch](https://github.com/farion1231/cc-switch) 是跨平台桌面工具，用一份設定檔管理多家 AI provider 並一鍵切換。**2026 年版支援範圍已擴大**：Claude Code、Codex、**OpenCode、OpenClaw、Gemini CLI、Hermes Agent** 都能同步切換（官方網站 ccswitch.io）。

> 📌 本 repo 早期文件只提到 Claude Code / Codex，那是舊版資訊。新版 CC Switch 的特色：一份設定同步到多套工具、系統匣一鍵切換、拖拉排序、設定檔匯入匯出。

---

## 複製以下提示詞：

```text
請幫我在這台電腦安裝 CC Switch，並把所有可用的免費/平價 AI provider 一次配置好。

請自動完成以下項目：
1. 從 https://github.com/farion1231/cc-switch/releases 或官方網站 https://ccswitch.io 下載最新版：
   - Windows: CC-Switch-v{version}-Windows.msi 或 Windows-Portable.zip
   - macOS: 對應 dmg
   - Linux: 對應 AppImage/deb
2. 安裝後開啟 CC Switch，依序新增以下 Provider（每個都標註用途，API Key 我會自己填入，你不要寫死任何金鑰）：
   - 【主力】HakkaAICODE 本地代理: Base URL http://127.0.0.1:15722/v1（需先啟動 zen-header-injector）
   - 【Coding 備援】Mistral Codestral: Base URL https://api.mistral.ai/v1, Model codestral-latest
   - 【多模型備援】OpenRouter: Base URL https://openrouter.ai/api/v1（:free 模型以 API 即時查詢為準）
   - 【大上下文】Google AI Studio: Base URL https://generativelanguage.googleapis.com/v1beta/openai/
   - 【開源模型】NVIDIA NIM: Base URL https://integrate.api.nvidia.com/v1
   - 【研究/查資料】Perplexity Sonar: Base URL https://api.perplexity.ai（注意：此 provider 按量計費）
3. 檢查我安裝了哪些 AI 工具（Claude Code / Codex / OpenCode / Gemini CLI），在 CC Switch 中把支援的同步目標都打開。
4. 把 HakkaAICODE 本地代理設為預設 Provider，並示範一次切換到 Codestral 再切回來。
5. 完成後列出：CC Switch 版本、已建立的 Provider 清單、同步到哪些工具。
```

---

## 備註
- **為什麼用 CC Switch 而不是手改設定檔**：Claude Code / Codex 等工具的 provider 設定分散在各自的 JSON/TOML 裡，CC Switch 統一管理並同步，切換時不用重開終端機。
- **Provider 挑選邏輯**：日常 coding → HakkaAICODE 代理（Zen 免費池）；Zen 429 → Codestral；需要特殊開源模型 → OpenRouter/NIM；整專案重構 → Gemini（1M context）；查最新文件 → Perplexity。
- **Windows 自動化**：本 repo 的 `scripts/install-zen-windows.ps1` 會順便下載 CC Switch portable 版，可先跑它再執行上面的提示詞。
