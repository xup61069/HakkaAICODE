# NVIDIA NIM 免費層配置提示詞（新增）

NVIDIA NIM（build.nvidia.com）提供約 **40 RPM** 的免費推論額度，托管大量開源模型（DeepSeek、Llama、Qwen、Nemotron 等），是原 repo 漏掉的免費路線。

> ⚠️ 注意：註冊需要**手機號碼驗證**；免費層資料政策以 NVIDIA 官方條款為準。

---

## 複製以下提示詞：

```text
請幫我將這台電腦的 AI coding 環境（Claude Code / Codex / opencode / Roo Code）設定為使用 NVIDIA NIM 的免費 API 後端。

NVIDIA_API_KEY=你的 NVIDIA API KEY（至 https://build.nvidia.com/ 註冊取得）

請自動完成以下項目：
1. 若尚未取得金鑰，請引導我開啟 https://build.nvidia.com/ 註冊（需手機驗證），在任意模型頁面點 "Get API Key"。
2. 協助我在 CC Switch 或環境變數中新增 NVIDIA NIM Provider：
   - Base URL: https://integrate.api.nvidia.com/v1
   - API Key: (我所提供的 NVIDIA_API_KEY)
3. 呼叫 GET https://integrate.api.nvidia.com/v1/models 列出當下可用模型，優先挑選：
   - 支援 tool/function calling 的模型（coding agent 必需）
   - context window ≥ 128k
   - coding 導向的模型（如 qwen coder、deepseek 系列）
   列出前 5 名讓我挑選，不要寫死型號。
4. 發送測試請求驗證連線，列出當前設定與生效模型。
5. 不要把我的金鑰寫進 repo、log 或任何公開檔案。
```

---

## 備註
- NIM 的優勢是**模型選擇多、推論在 NVIDIA 自家 GPU 上跑**，開源模型更新速度快。
- 40 RPM 對互動式 coding agent 够用，但不適合高併發批次任務。
