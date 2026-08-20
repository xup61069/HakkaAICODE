# Perplexity Sonar API 配置提示詞（新增）

Perplexity Sonar API 是「**即時聯網搜尋 + 附引用來源**」的回答型 API，OpenAI 相容。定位是**研究、查最新文件、技術調研**——不是 coding 主力模型，但和 coding agent 互補性極高（例如讓 agent 查「某套件最新版 API 怎麼用」）。

> ⚠️ **費用注意**：
> 1. Sonar API 是**預付費制**（先儲值、按量計費），沒有永久免費層。
> 2. 新帳號曾有 $5 一次性體驗金；Pro 訂閱的「每月 $5 API credit」在 2026 年初有用戶回報已停止發放，但部分官方頁面仍列出——**請以你自己的 billing 頁面為準**。
> 3. 計費 = token 費 + 每次請求的搜尋費。參考：sonar 約 $1/$1 per 1M tokens + 每千次請求約 $5 搜尋費；sonar-pro / sonar-deep-research 費用更高。以 https://docs.perplexity.ai 定價頁為準。

---

## 複製以下提示詞：

```text
請幫我在這台電腦的 CC Switch 中新增 Perplexity Sonar API 作為「研究/查資料專用」Provider。

PERPLEXITY_API_KEY=你的 PERPLEXITY API KEY（至 https://www.perplexity.ai/settings/api 建立 API group 並儲值）

請自動完成以下項目：
1. 若尚未取得金鑰，請引導我開啟 https://www.perplexity.ai/settings/api 建立 API group、儲值並產生 API Key。
2. 在 CC Switch 新增 Perplexity Provider（OpenAI 相容）：
   - Base URL: https://api.perplexity.ai
   - API Key: (我所提供的 PERPLEXITY_API_KEY)
   - 用途標註：研究 / 聯網搜尋，不作為 coding 預設模型
3. 查閱 https://docs.perplexity.ai 確認當下可用的 Sonar 模型清單（如 sonar、sonar-pro 等），預設選最便宜的 sonar，不要寫死過時型號。
4. 發送一個測試請求（例如「After Effects 2026 最新版本號是多少」），確認回應包含 citations 引用欄位。
5. 提醒我：Sonar 每次請求除了 token 費還有搜尋費，大量呼叫前先看帳戶餘額。
6. 不要把我的金鑰寫進 repo、log 或任何公開檔案。
```

---

## 備註
- **什麼時候用 Perplexity**：需要「最新、有來源」的答案時——套件的最新文件、版本號、changelog、價格變動。coding agent 內建知識有 cutoff，Sonar 是補上即時性的最便宜方案之一。
- **什麼時候不要用**：純寫程式、重構、補全——Sonar 不是為程式碼生成優化的模型，這些交給 Codestral / Zen / DeepSeek。
- **省錢技巧**：預設用 `sonar`（最便宜），只有需要多步推理的研究才切 `sonar-pro`；在 agent 的 system prompt 註明「只有需要查最新資訊才呼叫 Perplexity provider」。
