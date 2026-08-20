# Mistral Codestral 免費層配置提示詞（新增）

Mistral 的 Codestral 是**專門為程式碼任務訓練**的模型，免費層約 **30 RPM / 每日 2,000 次請求**，是目前免費 API 中最適合接 coding agent 的選項之一，也是原 repo 完全漏掉的好貨。

> ⚠️ 注意：
> 1. Codestral 有兩個端點：通用的 `https://api.mistral.ai/v1` 與程式碼專用的 `https://codestral.mistral.ai/v1`，以你的 agent 支援的協定為準。
> 2. 免費層（Experiment plan）的資料**可能被 Mistral 用於訓練**，敏感專案請升級付費方案。

---

## 複製以下提示詞：

```text
請幫我將這台電腦的 AI coding 環境（Claude Code / Codex / opencode / Roo Code）設定為使用 Mistral Codestral 的免費 API 後端。

MISTRAL_API_KEY=你的 MISTRAL API KEY（至 https://console.mistral.ai/ 註冊，選 Experiment 免費方案）

請自動完成以下項目：
1. 若尚未取得金鑰，請引導我開啟 https://console.mistral.ai/ 註冊並在 API keys 頁面建立金鑰。
2. 協助我在 CC Switch 或環境變數中新增 Mistral Provider：
   - Base URL: https://api.mistral.ai/v1
   - API Key: (我所提供的 MISTRAL_API_KEY)
   - Model: codestral-latest
3. 若我的 agent 是純補全/FIM 用途（如 Continue.dev 的 autocomplete），請改用程式碼專用端點：
   - Base URL: https://codestral.mistral.ai/v1
   - Model: codestral-latest
4. 呼叫 GET https://api.mistral.ai/v1/models 確認 codestral-latest 目前指向的版本，並檢查我的方案當下速率限制。
5. 發送一個程式碼生成測試請求驗證連線，列出當前設定。
6. 不要把我的金鑰寫進 repo、log 或任何公開檔案。
```

---

## 備註
- Codestral 的 **FIM（fill-in-the-middle）補全**特別強，拿來接 IDE autocomplete 比一般 chat 模型順手。
- 每日 2,000 次請求對個人開發者相當充裕，可當 OpenCode Zen 免費池乾掉時的第一備援。
