# GLM Coding Plan（Z.ai）平價吃到飽配置提示詞（新增）

如果免費額度常常不夠用，**GLM Coding Plan 是目前最便宜的大模型吃到飽方案**：

| 方案 | 月費 | 額度機制 |
|---|---|---|
| Lite | $18/月（促銷 $12.6） | 每 5 小時一輪重置的 prompt 額度 |
| Pro | $72/月 | 約 Lite 的 5 倍 |
| Max | $160/月 | 約 Lite 的 20 倍 |

重點：額度是**每 5 小時重置**而不是每月總量，分散使用的實際吞吐量遠高於表面數字。直接支援 Claude Code、Cline、Roo Code、opencode 等 20+ 種工具（OpenAI/Anthropic 相容端點）。

---

## 複製以下提示詞：

```text
請幫我將這台電腦的 AI coding 環境設定為使用 GLM Coding Plan（Z.ai）後端。

ZAI_API_KEY=你的 Z.AI API KEY（至 https://z.ai/subscribe 訂閱 Coding Plan 後，在 https://z.ai/manage-apikey 取得）

請自動完成以下項目：
1. 若尚未訂閱，請引導我開啟 https://z.ai/subscribe 選擇 Lite 方案並取得 API key。
2. 依我使用的工具設定對應端點（以 https://docs.z.ai 當下文件為準）：
   - OpenAI 相容工具（opencode / Roo Code / Continue）：Base URL 用 Z.ai 的 OpenAI-compatible endpoint
   - Claude Code：Z.ai 提供 Anthropic 相容端點，設定 ANTHROPIC_BASE_URL 與 ANTHROPIC_AUTH_TOKEN
3. 模型選擇：從我方案可用的最新 GLM-5.x 旗艦與 GLM-5.x-Air（省額度）中設定預設值，不要寫死版本號。
4. 發送測試請求驗證連線，並列出我的方案當下的 5 小時額度與重置時間。
5. 不要把我的金鑰寫進 repo、log 或任何公開檔案。
```

---

## 備註
- **什麼人該買**：每天 coding agent 用量超過免費層總和（Zen 100 次 + OpenRouter 50 次 + Codestral 等免費額度還不夠）的人。
- **與免費層混用**：日常互動走 GLM Coding Plan，批次排程任務走 DeepSeek API 按量計費（$0.14/$0.28 per 1M tokens，cache hit 只要 $0.0028），兩者互補最便宜。
- GLM-5.x 是開放權重模型（MIT license），重視隱私也可考慮自架。
